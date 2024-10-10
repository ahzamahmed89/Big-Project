import React, { useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import BranchDetails from '../components/BranchDetails';
import DateSelector from '../components/DateSelector';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import ActivityForm from '../components/ActivityForm';
import SearchBar from '../components/SearchBar';
import YearDropdown from '../components/YearDropdown';
import QuarterDropdown from '../components/QuarterDropdown';
import FeatureItem from '../components/Banner';


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
const getCurrentQuarter = (month) => {
    if (month >= 1 && month <= 3) return 'Q1';
    if (month >= 4 && month <= 6) return 'Q2';
    if (month >= 7 && month <= 9) return 'Q3';
    return 'Q4';
};
const EditForm = () => {
    const [branchCode, setBranchCode] = useState('');
    const [branchName, setBranchName] = useState('');
    const [regionName, setRegionName] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [quarter, setQuarter] = useState(getCurrentQuarter(new Date().getMonth() + 1));
    const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
    const [Visit_Time, setVisitTime] = useState('');
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
    const handleVisitDateChange = (e) => setVisitDate(e.target.value || '');

    const handleYearChange = (newYear) => setYear(newYear || new Date().getFullYear());
    const updateActivityState = useCallback((code, field, value) => {
        setActivityState((prevState) => ({
          ...prevState,
          [code]: {
            ...prevState[code],
            [field]: value,
          },
        }));
      }, []);
    const handleQuarterChange = (newQuarter) => setQuarter(newQuarter || '');

    const handleResponsibilityChange = (responsibility, code) => {
        setActivityState(prevState => ({
            ...prevState,
            [code]: {
                ...prevState[code],
                responsibility,
            },
        }));
    };
    const handleImageChange = (file, code) => {
        const imageURL = URL.createObjectURL(file);
        
      
        setImages((prevImages) => ({
          ...prevImages,
          [code]: file,
        }));
        updateActivityState(code, 'image', file);
      };
      

      

    const handleGenerateFormClick = async (event) => {
        event.preventDefault();
        const branchCodeValue = branchCode.trim();

        if (!branchCodeValue || branchName.trim() === 'Branch not found') {
            alert('Please check branch code and name.');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/fetch-all-activities`, {
                params: { branchCode: branchCodeValue, year, quarter }
            });

            const { success, message, data } = response.data;
            if (success) {
                const groupedData = groupActivitiesByCategory(data);
                const initialActivityState = {};
                data.forEach((activity) => {
                    initialActivityState[activity.Code] = {
                        status: activity.Status || '',
                        responsibility: activity.Responsibility || '',
                        remarks: activity.Remarks || '',
                        image: activity.Images || '',

                    };

                });
               
                setData(groupedData);
                setActivityState(initialActivityState);
                
                setFormGenerated(true);
                setFormDisabled(true);

                if (data.length > 0) {
                    setVisitDate(data[0]?.Visit_Date || '');
                    setVisitedBy(data[0]?.Visited_By || '');
                    setReviewedBy(data[0]?.Reviewed_By_OM_BM || '');
                    setMonth(data[0]?.Month || '');
                    setVisitTime(data[0]?.Visit_Time || '');

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

    // Submit function
    const handleSubmitFormClick = async () => {
        const formDetails = {
            branchCode,
            visitDate,
            visitedBy,
            reviewedBy,
            year,
            quarter,
            activities: Object.values(data).flat(),
        };
        Object.values(data).flat().forEach(item => {
            const fileInput = document.querySelector(`[data-code="${item.Code}"] .image-upload`);
            if (fileInput && fileInput.files[0]) {
                formData.append(`Images-${item.Code}`, fileInput.files[0], fileInput.files[0].name); // Ensure the field name includes the activity code
            } else {
                console.log(`No file found for activity code: ${item.Code}`);
            }
        });
        try {
            const response = await axios.post('http://localhost:5000/submit-edit', formDetails);
            if (response.data.success) {
                alert('Changes saved successfully');
            } else {
                alert('Failed to save changes');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('An error occurred while saving changes.');
        }
    };

    const flatActivities = useMemo(() => {
        return Object.keys(data).flatMap(category => data[category].map(activity => ({
            activity: activity.Activity,
            category
        })));
    }, [data]);

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

   const handleImageRemove = (code) => {
  console.log('Before removing:', images);
  setImages((prevImages) => ({
    ...prevImages,
    [code]: null,
  }));
  updateActivityState(code, 'image', null);
  setForceUpdate(!forceUpdate);
};

      
      
    return (
        <div className="new-entry-form-container" style={{ flex: '2', display: 'flex', flexDirection: 'column', position: 'fixed' }}>
            <div className="form-container" style={{ marginBottom: '5px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: '1' }}>
                        <FeatureItem
                            title="Edit Form"
                            description="Edit branch data here!"
                            accentColor="Red"
                        />
                    </div>

                    <div className="new-entry-form-wrapper">
                        <div className="firstForm" style={{ flex: '1 0 auto' }}>
                            <form className="edit-entry-form" id="editForm">
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
                                    />
                                </div>
                                <div className="form-row">
                                    <FormInput
                                        label="Visited By"
                                        type="text"
                                        id="visitedBy"
                                        value={visitedBy || ''}
                                        onChange={(e) => setVisitedBy(e.target.value)}
                                    />
                                    <FormInput
                                        label="Reviewed By"
                                        type="text"
                                        id="reviewedBy"
                                        value={reviewedBy || ''}
                                        onChange={(e) => setReviewedBy(e.target.value)}
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
                        handleSubmitFormClick={handleSubmitFormClick}
                        submitDisabled={submitDisabled}
                        handleImageRemove={handleImageRemove}
                        activityState={activityState}  // Pass the activity state to ActivityForm
                        updateActivityState={updateActivityState}
                        statusOptions={statusOptions}  // Pass status options
                        responsibilityOptions={responsibilityOptions}
                        handleResponsibilityChange={handleResponsibilityChange}
                        isEditForm={true}  // Enable fields for editing

                    />
                </div>
            )}
        </div>
    );
};

export default EditForm;
