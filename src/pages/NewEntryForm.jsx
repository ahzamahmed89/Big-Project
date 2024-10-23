import React, { useCallback, useState, useEffect, useMemo } from 'react';
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
  const [data, setData] = useState({}); // Stores the grouped activities by category
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [formGenerated, setFormGenerated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedResponsibility, setSelectedResponsibility] = useState([]);
  const [images, setImages] = useState({});
  const [activityState, setActivityState] = useState({});  // Persist activity states (status, responsibility, remarks)
  const currentDate = new Date();
  const [statusOptions, setStatusOptions] = useState(['Yes', 'No', 'NA']);  // Default initial status options
  const [responsibilityOptions, setResponsibilityOptions] = useState(['Admin', 'HR', 'IT', 'Operations']);  // Default initial responsibility options
  const [categories, setCategories] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(false);
  // Initialize the selectors for visit date, quarter, and month
  useEffect(() => {
    initializeSelectors();
  }, []);

  const initializeSelectors = () => {
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
  
    let minDate;
    if (currentDay >= 11) {
      minDate = new Date(currentYear, currentMonth, 1);
    } else {
      minDate = currentMonth === 0 ? new Date(currentYear - 1, 11, 1) : new Date(currentYear, currentMonth - 1, 1);
    }
  
    const formattedMinDate = minDate.toISOString().split('T')[0];
    const formattedMaxDate = currentDate.toISOString().split('T')[0];
  
    document.querySelector('#visitDate').min = formattedMinDate;
    document.querySelector('#visitDate').max = formattedMaxDate;
  
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
    return sortedData.reduce((acc, activity) => {
      const { Category } = activity;
      if (!acc[Category]) {
        acc[Category] = [];
      }
      acc[Category].push(activity);
      return acc;
    }, {});
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
        console.log('API Response:', response.data);
        const data = response.data;
        if (data.success) {
          alert(data.message);
        } else {
          const groupedData = groupActivitiesByCategory(data.data);
          
          // Initialize activityState from the fetched data
          const initialActivityState = {};
          data.data.forEach(activity => {
            initialActivityState[activity.Code] = {
              status: activity.Status || '',  // Set initial status
              responsibility: activity.Responsibility || '',  // Set initial responsibility
              remarks: activity.Remarks || '',  // Set initial remarks
              image: activity.Images || '',  // Set image if available
            };
          });

          setData(groupedData);
          setActivityState(initialActivityState);  // Persist fetched data in the activityState
          setFormGenerated(true);
          setFormDisabled(true);

          // Extract unique status, responsibility, and category options from fetched data
          const categoriesList = Array.from(new Set(data.data.map(activity => activity.Category)));
          const statusesList = Array.from(new Set(data.data.map(activity => activity.Status)));
          const responsibilitiesList = Array.from(new Set(data.data.map(activity => activity.Responsibility)));

          setCategories(categoriesList);
          setStatusOptions(prev => [...new Set([...prev, ...statusesList])]);  // Dynamically update status options
          setResponsibilityOptions(prev => [...new Set([...prev, ...responsibilitiesList])]);  // Dynamically update responsibility options
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
    const imageURL = URL.createObjectURL(file);
    setImages((prevImages) => ({
      ...prevImages,
      [code]: file,
    }));
    updateActivityState(code, 'image', file);
  };
  const handleImageRemove = (code) => {
    console.log('Before removing:', images);
    setImages((prevImages) => ({
      ...prevImages,
      [code]: null,
    }));
    updateActivityState(code, 'image', null);
    setForceUpdate(!forceUpdate);
  };
  // Handle status, responsibility, remarks updates in activityState
  const updateActivityState = useCallback((code, field, value) => {
    setActivityState((prevState) => ({
      ...prevState,
      [code]: {
        ...prevState[code],
        [field]: value,
      },
    }));

    // **Dynamically update status and responsibility options if a new value is added:**
    if (field === 'status' && value && !statusOptions.includes(value)) {
      setStatusOptions(prev => [...prev, value]);
    }
    if (field === 'responsibility' && value && !responsibilityOptions.includes(value)) {
      setResponsibilityOptions(prev => [...prev, value]);
    }
  }, [statusOptions, responsibilityOptions]);

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
        Status: activityState[item.Code]?.status || '',  // Use persisted state for status
        Responsibility: activityState[item.Code]?.responsibility || '',  // Use persisted state for responsibility
        Remarks: activityState[item.Code]?.remarks || '',  // Use persisted state for remarks
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
    setSelectedStatus([]);
    setSelectedResponsibility([]);
    setSubmitDisabled(true);
    setFormDisabled(true);
    setImages({});
  };

  // **Define flatActivities:**
  const flatActivities = useMemo(() => {
    return Object.keys(data).flatMap(category => data[category].map(activity => ({
      activity: activity.Activity,
      category
    })));
  }, [data]);

  // **Update filteredData to include status and responsibility filtering:**
  const filteredData = useMemo(() => {
    return Object.keys(data).reduce((acc, category) => {
      if (selectedCategory.length === 0 || selectedCategory.includes(category)) {
        const filteredActivities = data[category].filter(activity => {
          const matchesCategory = selectedActivity.length === 0 || selectedActivity.includes(activity.Activity);
          
          // Check updated status from activityState, fallback to initial status from data
          const updatedStatus = activityState[activity.Code]?.status || activity.Status;
          const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(updatedStatus);
  
          const assignedResponsibility = activityState[activity.Code]?.responsibility || '';
          const matchesResponsibility = selectedResponsibility.length === 0 || 
                                        (assignedResponsibility && selectedResponsibility.includes(assignedResponsibility));
  
          return matchesCategory && matchesStatus && matchesResponsibility;
        });
        if (filteredActivities.length > 0) {
          acc[category] = filteredActivities;
        }
      }
      return acc;
    }, {});
  }, [data, selectedCategory, selectedActivity, selectedStatus, selectedResponsibility, activityState]);

  const handleResponsibilityChange = (responsibility, code) => {
    setActivityState(prevState => ({
      ...prevState,
      [code]: {
        ...prevState[code],
        responsibility,
      },
    }));
  };  
  

  return (
    <div className="new-entry-form-container" >
      <div className="form-container" style={{ marginBottom: '5px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="bannerdiv">
            <FeatureItem
              title="New Entry Form"
              description="Enter new branch data here!"
              accentColor="Green"
            />
          </div>

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

      {formGenerated && (
        <div className="activities-container">
          <SearchBar
            categories={categories}
            activities={flatActivities}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedActivity={selectedActivity}
            setSelectedActivity={setSelectedActivity}
            statusOptions={statusOptions}  // Dynamic status options
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            responsibilityOptions={responsibilityOptions}  // Dynamic responsibility options
            selectedResponsibility={selectedResponsibility}
            setSelectedResponsibility={setSelectedResponsibility}
          />

          <ActivityForm
            data={filteredData}
            handleImageChange={handleImageChange}
            handleImageRemove={handleImageRemove}
            handleSubmitFormClick={handleSubmitFormClick}
            submitDisabled={submitDisabled}
            isNewEntryForm={true}
            activityState={activityState}  // Pass the activity state to ActivityForm
            updateActivityState={updateActivityState} 
            statusOptions={statusOptions}  // Pass status options
            responsibilityOptions={responsibilityOptions} 
            handleResponsibilityChange={handleResponsibilityChange}  
          />
        </div>
      )}
    </div>
  );
};

export default NewEntryForm;
