import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import BranchDetails from '../components/BranchDetails';
import DateSelector from '../components/DateSelector';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import ActivityForm from '../components/Display/DisplayActivityForm';
import SearchBar from '../components/SearchBar';
import YearDropdown from '../components/YearDropdown'; // Import the YearDropdown component
import QuarterDropdown from '../components/QuarterDropdown'; // Import the QuarterDropdown component
import FeatureItem from '../components/Banner'

const groupActivitiesByCategory = (data) => {
  return data.reduce((acc, activity) => {
    const { Category } = activity;
    if (!acc[Category]) acc[Category] = [];
    acc[Category].push(activity);
    return acc;
  }, {});
};

const DisplayReviewForm = () => {
  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [regionName, setRegionName] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
  const [quarter, setQuarter] = useState(""); // Default to an empty string
  const [visitDate, setVisitDate] = useState('');
  const [visitedBy, setVisitedBy] = useState('');
  const [reviewedBy, setReviewedBy] = useState('');
  const [formDisabled, setFormDisabled] = useState(true);
  const [data, setData] = useState({});
  const [formGenerated, setFormGenerated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState([]);

  const handleVisitDateChange = (e) => setVisitDate(e.target.value);

  const handleYearChange = (newYear) => setYear(newYear);

  const handleQuarterChange = (newQuarter) => setQuarter(newQuarter);

  const handleGenerateFormClick = async (event) => {
    event.preventDefault();
    const branchCodeValue = branchCode.trim();

    if (!branchCodeValue || branchName.trim() === "Branch not found") {
      alert("Please check branch code and name.");
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
        // Assuming visitDate, visitedBy, reviewedBy, and month are derived from the data
        if (data.length > 0) {
          setVisitDate(data[0].Visit_Date);
          setVisitedBy(data[0].Visited_By);
          setReviewedBy(data[0].Reviewed_By_OM_BM);
          setMonth(data[0].Month);
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



  const filteredData = Object.keys(data)
    .filter(category => selectedCategory.length === 0 || selectedCategory.includes(category))
    .reduce((acc, category) => {
      acc[category] = data[category].filter(activity => selectedActivity.length === 0 || selectedActivity.includes(activity.Activity));
      return acc;
    }, {});

  return (
    <div className="new-entry-form-container" style={{ flex: '2', display: 'flex', flexDirection: 'column', position: 'fixed' }}>
      {/* Container for the form (including banner and form fields) */}
      <div className="form-container" style={{ marginBottom: '5px' }}>
        {/* Flex container for banner and form */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Left side with the banner or feature item */}
          <div style={{ flex: '1' }}>
            <FeatureItem

              title="Display/Review"
              description="Display or Review branch data here!"
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
                  disableFields={true}
                />
                <div className="form-row">
                  <YearDropdown
                    selectedYear={year}
                    onYearChange={handleYearChange}
                    disabled={formDisabled}
                  />
                  <QuarterDropdown
                    selectedQuarter={quarter}
                    onQuarterChange={handleQuarterChange}
                    disabled={formDisabled}
                  />

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
                    disabled={true}
                  />
                </div>
                <div className="form-row">
                  <FormInput
                    label="Visited By"
                    type="text"
                    id="visitedBy"
                    value={visitedBy}
                    onChange={(e) => setVisitedBy(e.target.value)}
                    readOnly={true}
                  />
                  <FormInput
                    label="Reviewed By"
                    type="text"
                    id="reviewedBy"
                    value={reviewedBy}
                    onChange={(e) => setReviewedBy(e.target.value)}
                    readOnly={true}
                  />
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
         <div className="activities-container" >
          <SearchBar
            categories={Object.keys(data)}
            activities={Object.values(data).flatMap(category => category.map(activity => ({ activity: activity.Activity, category })))}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedActivity={selectedActivity}
            setSelectedActivity={setSelectedActivity}
          />
          <ActivityForm
          
            data={filteredData}
          
          />
        </div>
      )}
    </div>
  );
};

export default DisplayReviewForm;
