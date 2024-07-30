import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import CategorySection from './CategorySection';


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
      minDate = new Date(currentYear, currentMonth, 1);
    } else {
      minDate = new Date(currentYear, currentMonth - 1, 1);
    }

    const maxDate = currentDate;
    const minDateString = minDate.toISOString().split('T')[0];
    const maxDateString = maxDate.toISOString().split('T')[0];

    const visitDateInput = document.getElementById('visitDate');
    visitDateInput.min = minDateString;
    visitDateInput.max = maxDateString;

    updateMonthAndQuarter(new Date(visitDate));
  };

  const updateMonthAndQuarter = (selectedDate) => {
    const selectedMonth = selectedDate.getMonth();
    const quarters = ["Q1", "Q2", "Q3", "Q4"];
    const selectedQuarter = Math.floor(selectedMonth / 3);

    setMonth(new Intl.DateTimeFormat('en-US', { month: 'short' }).format(selectedDate));
    setQuarter(quarters[selectedQuarter]);
  };

  const handleBranchCodeChange = (e) => {
    const code = e.target.value.trim();
    setBranchCode(code);

    if (code && code.length === 3) {
      axios.get(`http://localhost:5000/branch/${code}`)
        .then(response => {
          const data = response.data;
          if (data.success) {
            setBranchName(data.data.Branch_Name);
            setRegionName(data.data.Region);
            setFormDisabled(false); // Enable the "Generate Form" button
          } else {
            setBranchName("Branch not found");
            setRegionName("");
            setFormDisabled(true); // Disable the "Generate Form" button
          }
        })
        .catch(error => {
          console.error('Fetch error:', error);
          alert('An error occurred while fetching branch details. Please try again.');
          setFormDisabled(true); // Disable the "Generate Form" button
        });
    } else {
      setBranchName("");
      setRegionName("");
      setFormDisabled(true); // Disable the "Generate Form" button
    }
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
    return data.reduce((acc, activity) => {
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

    console.log(`Checking entry for branch code: ${branchCodeValue}, year: ${year}, quarter: ${quarterValue}, month: ${monthValue}`);
    axios.get(`http://localhost:5000/check-entry?branchCode=${branchCodeValue}&year=${year}&quarter=${quarterValue}&month=${monthValue}`)
      .then(response => {
        const data = response.data;
        if (data.success) {
          alert(data.message);
        } else {
          const groupedData = groupActivitiesByCategory(data.data);
          setData(groupedData);
          setFormGenerated(true); // Form generated successfully
          setFormDisabled(true); // Disable the generate form button
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
      submitForm();
    }
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
    if (!visitedBy.trim()) {
      valid = false;
      message += 'Visited By is required.\n';
    }
    if (!visitDate.trim()) {
      valid = false;
      message += 'Visit Date is required.\n';
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

  const submitForm = () => {
    const formData = {
      Branch_Code: branchCode.trim(),
      Branch_Name: branchName.trim(),
      Region_Name: regionName.trim(),
      Month: month.trim(),
      Qtr: quarter.trim(),
      Year: new Date(visitDate).getFullYear(),
      Visited_By: visitedBy.trim(),
      Visit_Date: visitDate.trim(),
      Visit_Time: new Date().toLocaleTimeString(),
      Reviewed_By_OM_BM: reviewedBy.trim(),
      Activities: Object.values(data).flat().map(item => ({
        Code: item.Code,
        Status: document.querySelector(`[data-code="${item.Code}"] .status`).value,
        Responsibility: document.querySelector(`[data-code="${item.Code}"] .responsibility`).value.trim(),
        Remarks: document.querySelector(`[data-code="${item.Code}"] .remarks`).value.trim(),
      })),
    };
  
    axios.post('http://localhost:5000/submit-form', { data: JSON.stringify(formData) })
      .then(response => {
        const data = response.data;
        if (data.success) {
          alert('Form submitted successfully!');
          setSubmitDisabled(true);
        } else {
          alert('Failed to submit form: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Submit error:', error);
        if (error.response) {
          console.error('Data:', error.response.data);
          console.error('Status:', error.response.status);
          console.error('Headers:', error.response.headers);
        } else if (error.request) {
          console.error('Request:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
        alert('An error occurred while submitting the form. Please try again.');
      });
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

  return (
    <div className="new-entry-form-container">
      <div className="firstForm">
        <form className="new-entry-form" id="entryForm">
          <div className="form-row">
            <div className="form-group small-input">
              <label htmlFor="branchCode">Branch Code</label>
              <input
                type="text"
                id="branchCode"
                value={branchCode}
                onChange={handleBranchCodeChange}
                required
                disabled={formGenerated}
              />
            </div>
            <div className="form-group">
              <label htmlFor="branchName">Branch Name</label>
              <input
                type="text"
                id="branchName"
                value={branchName}
                readOnly
                disabled={formGenerated}
              />
            </div>
            <div className="form-group">
              <label htmlFor="regionName">Region</label>
              <input
                type="text"
                id="regionName"
                value={regionName}
                readOnly
                disabled={formGenerated}
              />
            </div>
          </div>
          <div className="form-row">
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
            <div className="form-group">
              <label htmlFor="visitDate">Visit Date</label>
              <input
                type="date"
                id="visitDate"
                value={visitDate}
                onChange={handleVisitDateChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="visitedBy">Visited By</label>
              <input
                type="text"
                id="visitedBy"
                value={visitedBy}
                onChange={(e) => setVisitedBy(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reviewedBy">Reviewed By</label>
              <input
                type="text"
                id="reviewedBy"
                value={reviewedBy}
                onChange={(e) => setReviewedBy(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="button"
            className="generate-form-button"
            onClick={handleGenerateFormClick}
            disabled={formDisabled}
          >
            Generate Form
          </button>
        </form>
      </div>
      <form id="activityForm">
        {Object.keys(data).length > 0 && (
          Object.keys(data).map((category) => (
            <CategorySection
              key={category}
              category={category}
              activities={data[category]}
            />
          ))
        )}
        <button
          type="button"
          className="submit-button"
          onClick={handleSubmitFormClick}
          disabled={submitDisabled}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default NewEntryForm;
