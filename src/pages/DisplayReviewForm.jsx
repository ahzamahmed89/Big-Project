import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import BranchDetails from '../components/BranchDetails';
import DateSelector from '../components/DateSelector';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import ActivityForm from '../components/ActivityForm';
import SearchBar from '../components/SearchBar';

const DisplayReviewForm = () => {
  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [regionName, setRegionName] = useState('');
  const [month, setMonth] = useState('');
  const [quarter, setQuarter] = useState('');
  const [visitDate, setVisitDate] = useState(''); // Default to blank
  const [visitedBy, setVisitedBy] = useState('');
  const [reviewedBy, setReviewedBy] = useState('');
  const [formDisabled, setFormDisabled] = useState(true);
  const [data, setData] = useState({});
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [formGenerated, setFormGenerated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState([]);

  const currentDate = new Date();

  useEffect(() => {
    initializeSelectors();
  }, []);

  const initializeSelectors = () => {
    const selectedQuarter = Math.floor(currentDate.getMonth() / 3);
    const quarters = ["Q1", "Q2", "Q3", "Q4"];
    setQuarter(quarters[selectedQuarter]);
  };

  const handleVisitDateChange = (e) => {
    setVisitDate(e.target.value);
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
    const year = new Date(visitDate || new Date()).getFullYear(); 
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
          setFormGenerated(true); 
          setFormDisabled(true); 
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        alert('An error occurred while checking the entry. Please try again.');
      });
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

  const finalFilteredData = selectedActivity.length === 0
    ? filteredData
    : Object.keys(filteredData).reduce((acc, category) => {
        acc[category] = filteredData[category].filter(activity => selectedActivity.includes(activity.Activity));
        return acc;
      }, {});

  const handleBranchCodeChange = (newBranchCode) => {
    setBranchCode(newBranchCode);
    if (newBranchCode.trim() !== "") {
      setFormDisabled(false);
    } else {
      setFormDisabled(true);
    }
  };

  return (
    <div className="new-entry-form-container">
      <div className="firstForm">
        <form className="new-entry-form" id="entryForm">
          <BranchDetails
            branchCode={branchCode}
            setBranchCode={handleBranchCodeChange}
            setBranchName={setBranchName}
            setRegionName={setRegionName}
            setFormDisabled={setFormDisabled}
            formGenerated={formGenerated}
            disableFields={true} 
          />
          <div className="form-row">
            <div className="form-group small-input">
              <label htmlFor="quarter">Quarter</label>
              <input
                type="text"
                id="quarter"
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                disabled={formDisabled} 
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
              minDate={''} 
              maxDate={''} 
              disabled={true}
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
                readOnly={true} 
              />
            </div>
            <div className="form-group">
              <FormInput
                label="Reviewed By"
                type="text"
                id="reviewedBy"
                value={reviewedBy}
                onChange={(e) => setReviewedBy(e.target.value)}
                readOnly={true} 
              />
            </div>
          </div>
          <FormButton
            onClick={handleGenerateFormClick}
            disabled={formDisabled}
            label="Generate Form"
          />
        </form>
      </div>
      {formGenerated && (
        <div>
          <SearchBar 
            categories={categories} 
            activities={activities} 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
            selectedActivity={selectedActivity} 
            setSelectedActivity={setSelectedActivity} 
          />
          <ActivityForm 
            data={finalFilteredData} 
            handleSubmitFormClick={handleSubmitFormClick} 
            submitDisabled={submitDisabled} 
          />
        </div>
      )}
    </div>
  );
};

export default DisplayReviewForm;
