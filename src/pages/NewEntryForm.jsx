import React, { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import BranchDetails from '../components/BranchDetails';
import DateSelector from '../components/DateSelector';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import SearchBar from '../components/SearchBar';
import ActivityForm from '../components/ActivityForm';
import FeatureItem from '../components/Banner';


const NewEntryForm = () => {
  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [regionName, setRegionName] = useState('');
  const [month, setMonth] = useState('');
  const [quarter, setQuarter] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitedBy, setVisitedBy] = useState('');
  const [reviewedBy, setReviewedBy] = useState('');
  const [formDisabled, setFormDisabled] = useState(true);
  const [data, setData] = useState({});
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [formGenerated, setFormGenerated] = useState(false);
  const [filteredActivities, setFilteredActivities] = useState({});
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState([]);
  const [images, setImages] = useState({});

  const currentDate = new Date();

  useEffect(() => {
    initializeSelectors();
  }, []);

  const initializeSelectors = () => {
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
  
    let minDate;
    if (currentDay >= 11) {
      // Allow the first day of the current month as min date if the current day is greater than or equal to the 11th
      minDate = new Date(currentYear, currentMonth, 1);
    } else {
     if(currentMonth  == 1){
      // Otherwise, allow the first day of the previous month as the min date
      minDate = new Date(currentYear -1, 12, 1);
     }else{
      minDate = new Date(currentYear, currentMonth - 1, 1);
    }
    }
  
    // Convert minDate to the proper format (YYYY-MM-DD) for the input field
    const formattedMinDate = minDate.toISOString().split('T')[0];
    const formattedMaxDate = currentDate.toISOString().split('T')[0];
  
    // Set min and max dates for DateSelector
    document.querySelector('#visitDate').min = formattedMinDate;
    document.querySelector('#visitDate').max = formattedMaxDate;
  
    // Set the initial month and quarter based on the selected date
    updateMonthAndQuarter(new Date(visitDate));
  };
  

  const updateMonthAndQuarter = (selectedDate) => {
    const selectedMonth = selectedDate.getMonth();
    const quarters = ["Q1", "Q2", "Q3", "Q4"];
    const selectedQuarter = Math.floor(selectedMonth / 3);

    setMonth(new Intl.DateTimeFormat('en-US', { month: 'short' }).format(selectedDate));
    setQuarter(quarters[selectedQuarter]);
  };

  const handleVisitDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    if (selectedDate > currentDate) {
      alert("Future Date Cannot Be Selected, Please Select Current Date");
      setVisitDate('');
      return;
    }

    setVisitDate(e.target.value);
    updateMonthAndQuarter(selectedDate);
  };

  const groupActivitiesByCategory = (data) => {
    const sortedData = data.sort((a, b) => a.seq - b.seq);
    const grouped = sortedData.reduce((acc, activity) => {
      const { Category } = activity;
      if (!acc[Category]) {
        acc[Category] = [];
      }
      acc[Category].push(activity);
      return acc;
    }, {});
    return grouped;
  };

  const handleGenerateFormClick = (event) => {
    event.preventDefault();
    const branchCodeValue = branchCode.trim();
    const year = new Date(visitDate).getFullYear();
    const monthValue = month;
    const quarterValue = quarter;

    if (!branchCodeValue) {
      alert("Branch code is required.");
      return;
    }

    if (branchName.trim() === "Branch not found") {
      alert("Invalid branch name.");
      return;
    }

    axios.get(`http://localhost:5000/check-entry?branchCode=${branchCodeValue}&year=${year}&quarter=${quarterValue}&month=${monthValue}`)
      .then(response => {
        const data = response.data;
        if (data.success) {
          alert(data.message);
        } else {
          const groupedData = groupActivitiesByCategory(data.data);
          setData(groupedData);
          setFormGenerated(true);
          setFormDisabled(true);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        alert('An error occurred while checking the entry. Please try again.');
      });
  };

  const handleSubmitFormClick = (event) => {
    event.preventDefault();
    if (validateForm() && validateStatus()) {
      const visitTime = prompt("Please enter visit time:", new Date().toLocaleTimeString());
      if (visitTime) {
        submitForm(visitTime);
      }
    }
  };

  const handleImageChange = (file, code) => {
    setImages((prevImages) => ({
      ...prevImages,
      [code]: file,
    }));
  };

  const validateForm = () => {
    let valid = true;
    let message = '';

    if (!branchCode.trim()) {
      valid = false;
      message += 'Branch Code is required.\n';
    }
    if (!branchName.trim() || branchName.trim() === "Branch not found") {
      valid = false;
      message += 'Valid Branch Name is required.\n';
    }
    if (!regionName.trim()) {
      valid = false;
      message += 'Region Name is required.\n';
    }
    if (!visitDate.trim()) {
      valid = false;
      message += 'Visit Date is required.\n';
    }
    if (!visitedBy.trim()) {
      valid = false;
      message += 'Visited By is required.\n';
    }
    if (!reviewedBy.trim()) {
      valid = false;
      message += 'Reviewed By is required.\n';
    }

    if (!valid) {
      alert(message);
    }

    return valid;
  };

  const validateStatus = () => {
    let valid = true;
    let message = '';

    Object.values(data).forEach(categoryActivities => {
      categoryActivities.forEach(item => {
        const statusElement = document.querySelector(`[data-code="${item.Code}"] .status`);
        const responsibilityElement = document.querySelector(`[data-code="${item.Code}"] .responsibility`);
        const remarksElement = document.querySelector(`[data-code="${item.Code}"] .remarks`);
        const activity = document.querySelector(`[data-code="${item.Code}"] .activity`).textContent;

        if (!statusElement || !statusElement.value || statusElement.value === '') {
          valid = false;
          message += `Please select a status for the activity: ${activity}\n`;
        }
        if (statusElement && statusElement.value === 'No' && (!responsibilityElement || !responsibilityElement.value.trim())) {
          valid = false;
          message += `Responsibility field is empty for the activity: ${activity}\n`;
        }
        if (statusElement && statusElement.value === 'No' && (!remarksElement || !remarksElement.value.trim())) {
          valid = false;
          message += `Remarks field is empty for the activity: ${activity}\n`;
        }
      });
    });

    if (!valid) {
      alert(message);
    }

    return valid;
  };

  const submitForm = (visitTime) => {
    const formDetails = {
      Branch_Code: branchCode.trim(),
      Branch_Name: branchName.trim(),
      Region_Name: regionName.trim(),
      Month: month.trim(),
      Qtr: quarter.trim(),
      Year: new Date(visitDate).getFullYear(),
      Visited_By: visitedBy.trim(),
      Visit_Date: visitDate.trim(),
      Visit_Time: visitTime,
      Reviewed_By_OM_BM: reviewedBy.trim(),
      Activities: Object.values(data).flat().map(item => ({
        Code: item.Code,
        Status: document.querySelector(`[data-code="${item.Code}"] .status`).value,
        Responsibility: document.querySelector(`[data-code="${item.Code}"] .responsibility`).value.trim(),
        Remarks: document.querySelector(`[data-code="${item.Code}"] .remarks`).value.trim(),
        Weightage: item.Weightage,
        Activity: item.Activity,
        Category: item.Category,
      })),
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(formDetails));

    // Append images to FormData
    Object.values(data).flat().forEach(item => {
      const fileInput = document.querySelector(`[data-code="${item.Code}"] .image-upload`);
      if (fileInput && fileInput.files[0]) {
        formData.append(`Images-${item.Code}`, fileInput.files[0], fileInput.files[0].name); // Ensure the field name includes the activity code
      }
    });


    axios.post('http://localhost:5000/submit-form', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        if (response.data.success) {
          alert('Form submitted successfully!');
          resetForm();
        } else {
          alert('Failed to submit form: ' + response.data.message);
        }
      })
      .catch(error => {
        console.error('Submit error:', error);
        if (error.response) {
          console.error('Data:', error.response.data);
          console.error('Status:', error.response.status);
          console.error('Headers:', error.response.headers);
        }
        alert('An error occurred while submitting the form. Please try again.');
      });
  };



  const resetForm = () => {
    setBranchCode('');
    setBranchName('');
    setRegionName('');
    setVisitDate(new Date().toISOString().split('T')[0]);
    setVisitedBy('');
    setReviewedBy('');
    setData({});
    setFormGenerated(false);
    setSelectedCategory([]);
    setSelectedActivity([]);
    setSubmitDisabled(true);
    setFormDisabled(true);
    setImages({});
  };

  useEffect(() => {
    const allStatusFieldsFilled = Object.values(data).every(categoryActivities =>
      categoryActivities.every(item => {
        const statusElement = document.querySelector(`[data-code="${item.Code}"] .status`);
        return statusElement && statusElement.value && statusElement.value !== '';
      })
    );

    setSubmitDisabled(!allStatusFieldsFilled);
  }, [data]);

  const categories = Object.keys(data);
  const activities = categories.flatMap(category => data[category].map(activity => ({ activity: activity.Activity, category })));

  const filteredData = selectedCategory.length === 0
    ? data
    : Object.keys(data)
      .filter(category => selectedCategory.includes(category))
      .reduce((acc, category) => {
        acc[category] = data[category];
        return acc;
      }, {});

 
  return (
    <div className="new-entry-form-container" style={{ flex: '2', display: 'flex', flexDirection: 'column', position: 'fixed' }}>
      {/* Container for the form (including banner and form fields) */}
      <div className="form-container" style={{ marginBottom: '5px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Left side with the banner or feature item */}
          <div style={{ flex: '1' }}>
            <FeatureItem
              title="New Entry Form"
              description="Enter new branch data here!"
              accentColor="Green"
            />
          </div>

          {/* Right side with the form */}
          <div className="new-entry-form-wrapper">
            <div className="firstForm" style={{ flex: '1 0 auto' }}>
              <form className="new-entry-form" id="entryForm">
                <BranchDetails
                  branchCode={branchCode}
                  setBranchCode={setBranchCode}
                  setBranchName={setBranchName}
                  setRegionName={setRegionName}
                  setFormDisabled={setFormDisabled}
                  formGenerated={formGenerated}
                />
                <div className="form-row quarter-month-date">
                  <div className="form-group small-input">
                    <label htmlFor="quarter">Quarter</label>
                    <input
                      type="text"
                      id="quarter"
                      value={quarter}
                      readOnly
                    />
                  </div>
                  <div className="form-group small-input">
                    <label htmlFor="month">Month</label>
                    <input
                      type="text"
                      id="month"
                      value={month}
                      readOnly
                    />
                  </div>
                  <DateSelector
                    id="visitDate"
                    value={visitDate}
                    onChange={handleVisitDateChange}
                    minDate={new Date().toISOString().split('T')[0]}
                    maxDate={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <FormInput
                      label="Visited By"
                      type="text"
                      id="visitedBy"
                      value={visitedBy}
                      onChange={(e) => setVisitedBy(e.target.value)}
                      readOnly={false}
                      enabled={formGenerated}
                    />
                  </div>
                  <div className="form-group">
                    <FormInput
                      label="Reviewed By"
                      type="text"
                      id="reviewedBy"
                      value={reviewedBy}
                      onChange={(e) => setReviewedBy(e.target.value)}
                      readOnly={false}
                      enabled={formGenerated}
                    />
                  </div>
                  <FormButton
                    onClick={handleGenerateFormClick}
                    disabled={formDisabled}
                    label="Generate Form"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Separate container for activities below the form */}
      {formGenerated && (
        <div className="activities-container">
          <SearchBar
            categories={categories}
            activities={activities}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedActivity={selectedActivity}
            setSelectedActivity={setSelectedActivity}
             
          />

          <ActivityForm
            data={filteredData}
            handleImageChange={handleImageChange}
            handleSubmitFormClick={handleSubmitFormClick}
            submitDisabled={submitDisabled}
            isNewEntryForm={true}  // New Entry Form flag passed here
            
          />
        </div>
      )}
    </div>
  );
};
export default NewEntryForm;
