import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';
import BranchDetails from '../components/BranchDetails';
import DateSelector from '../components/DateSelector';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import ActivityForm from '../components/ActivityForm';
import SearchBar from '../components/SearchBar';
import YearDropdown from '../components/YearDropdown';
import QuarterDropdown from '../components/QuarterDropdown';
import FeatureItem from '../components/Banner';
import ReviewButton from '../components/ReviewButton'; // Import ReviewButton

const groupActivitiesByCategory = (data) => {
  return data.reduce((acc, activity) => {
    const { Category } = activity;
    if (!acc[Category]) acc[Category] = [];
    acc[Category].push(activity);
    return acc;
  }, {});
};

const getCurrentQuarter = (month) => {
  if (month >= 1 && month <= 3) return 'Q1';
  if (month >= 4 && month <= 6) return 'Q2';
  if (month >= 7 && month <= 9) return 'Q3';
  return 'Q4';
};

const DisplayReviewForm = () => {
  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [regionName, setRegionName] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(getCurrentQuarter(new Date().getMonth() + 1));
  const [visitDate, setVisitDate] = useState('');
  const [visitedBy, setVisitedBy] = useState('');
  const [reviewedBy, setReviewedBy] = useState('');
  const [formDisabled, setFormDisabled] = useState(true);
  const [data, setData] = useState({});
  const [formGenerated, setFormGenerated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState([]);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const handleVisitDateChange = (e) => setVisitDate(e.target.value || '');

  const handleYearChange = (newYear) => setYear(newYear || new Date().getFullYear());

  const handleQuarterChange = (newQuarter) => setQuarter(newQuarter || '');

  const handleGenerateFormClick = async (event) => {
    event.preventDefault();
    const branchCodeValue = branchCode.trim();

    if (!branchCodeValue || branchName.trim() === 'Branch not found') {
      alert('Please check branch code and name.');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/fetch-activities', {
        params: { branchCode: branchCodeValue, year: year.toString(), quarter }
      });

      const { success, message, data } = response.data;
      if (success) {
        setData(groupActivitiesByCategory(data));
        setFormGenerated(true);
        setFormDisabled(true);

        if (data.length > 0) {
          setVisitDate(data[0]?.Visit_Date || '');
          setVisitedBy(data[0]?.Visited_By || '');
          setReviewedBy(data[0]?.Reviewed_By_OM_BM || '');
          setMonth(data[0]?.Month || '');
        }
      } else {
        alert(message);
        setFormGenerated(false);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleSubmitFormClick = async () => {
    const formDetails = {
      branchCode,
      visitDate,
      visitedBy,
      reviewedBy,
      year,
      quarter,
      activities: Object.values(data).flat(), // Assuming activities are flat arrays in data object
    };

    try {
      const response = await axios.post('http://localhost:5000/submit-review', formDetails);
      if (response.data.success) {
        alert('Review submitted successfully');
      } else {
        alert('Failed to submit review');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred while submitting the review.');
    }
  };

  const filteredData = Object.keys(data)
    .filter((category) => selectedCategory.length === 0 || selectedCategory.includes(category))
    .reduce((acc, category) => {
      acc[category] = data[category].filter((activity) =>
        selectedActivity.length === 0 || selectedActivity.includes(activity.Activity)
      );
      return acc;
    }, {});

  return (
    <div className="new-entry-form-container" style={{ flex: '2', display: 'flex', flexDirection: 'column', position: 'fixed' }}>
      <div className="form-container" style={{ marginBottom: '5px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: '1' }}>
            <FeatureItem
              title="Display/Review"
              description="Display or Review branch data here!"
              accentColor="blue"
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
                <div className="form-row">
                  <YearDropdown
                    selectedYear={year}
                    onYearChange={handleYearChange}
                  />
                  <QuarterDropdown
                    selectedQuarter={quarter}
                    onQuarterChange={handleQuarterChange}
                  />

                  <div className="form-group small-input">
                    <label htmlFor="month">Month</label>
                    <input
                      type="text"
                      id="month"
                      value={month || ''}
                      readOnly
                    />
                  </div>
                  <DateSelector
                    id="visitDate"
                    value={visitDate || ''}
                    onChange={handleVisitDateChange}
                    disabled={true}
                  />
                </div>
                <div className="form-row">
                  <FormInput
                    label="Visited By"
                    type="text"
                    id="visitedBy"
                    value={visitedBy || ''}
                    onChange={(e) => setVisitedBy(e.target.value)}
                    readOnly={true}
                  />
                  <FormInput
                    label="Reviewed By"
                    type="text"
                    id="reviewedBy"
                    value={reviewedBy || ''}
                    onChange={(e) => setReviewedBy(e.target.value)}
                    readOnly={true}
                  />
                  <FormButton
                    onClick={handleGenerateFormClick}
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
            categories={Object.keys(data)}
            activities={Object.values(data).flatMap((category) =>
              category.map((activity) => ({ activity: activity.Activity, category }))
            )}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedActivity={selectedActivity}
            setSelectedActivity={setSelectedActivity}
          />
          <ActivityForm
            data={filteredData}
            handleSubmitFormClick={handleSubmitFormClick}  // Pass handleSubmitFormClick
            submitDisabled={submitDisabled}
            isDisplayReviewForm={true}  // For Display Review Form
          />
          {/* Render ReviewButton */}
          <ReviewButton 
            branchCode={branchCode} 
            year={year} 
            quarter={quarter} 
            month={month} 
            handleSubmitFormClick={handleSubmitFormClick} 
          />
        </div>
      )}
    </div>
  );
};

export default DisplayReviewForm;
