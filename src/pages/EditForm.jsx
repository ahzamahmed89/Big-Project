    import React, { useEffect, useState, useMemo, useCallback, useContext } from 'react';
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
    import { UserContext } from '../components/UserContext';

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
    const updateMonthAndQuarter = (selectedDate, setMonth, setQuarter) => {
        const selectedMonth = selectedDate.getMonth();
        const quarters = ["Q1", "Q2", "Q3", "Q4"];
        const selectedQuarter = Math.floor(selectedMonth / 3);
    
        // Set the formatted month directly
        setMonth(new Intl.DateTimeFormat('en-US', { month: 'short' }).format(selectedDate));
        setQuarter(quarters[selectedQuarter]);
    };
    const EditForm = () => {
        const [branchCode, setBranchCode] = useState('');
        const [branchName, setBranchName] = useState('');
        const [regionName, setRegionName] = useState('');
        const [month, setMonth] = useState('');
        const [year, setYear] = useState(new Date().getFullYear());
        const [quarter, setQuarter] = useState(getCurrentQuarter(new Date().getMonth() + 1));
        const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
        const [visitTime, setVisitTime] = useState('');
        const [visitedBy, setVisitedBy] = useState('');
        const [reviewedBy, setReviewedBy] = useState('');
        const [formDisabled, setFormDisabled] = useState(true);
        const [data, setData] = useState({}); // Stores the grouped activities by category
        // const [submitDisabled, setSubmitDisabled] = useState(true);
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
        const { userID } = useContext(UserContext); // Get the global userID
 

  

        const handleVisitDateChange = (e) => {
            const newDate = e.target.value || '';
            setVisitDate(newDate);
    
            if (newDate) {
                // Use updateMonthAndQuarter to set month and quarter
                updateMonthAndQuarter(new Date(newDate), setMonth, setQuarter);
            } else {
                setMonth('');
                setQuarter('');
            }
        };

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


        };
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
                    params: { branchCode: branchCodeValue, year, quarter, MS_Type: "Physical", }
                });

                const { success, message, data } = response.data;

                if (success) {
                    if (message === 'Authorized data') {
                        // Display an alert if authorized data is found and prevent further processing
                        alert('Editing for authorized data is not allowed.');
                        return; // Stop execution here, preventing the rest of the code from running
                    }
                    const groupedData = groupActivitiesByCategory(data);
                    const initialActivityState = {};
                    data.forEach((activity) => {
                        initialActivityState[activity.Code] = {
                            status: activity.Status || '',
                            responsibility: activity.Responsibility || '',
                            remarks: activity.Remarks || '',
                            image: activity.Images || '',
                            weightage: activity.Weightage,
                            category: activity.Category,
                            activity: activity.Activity,
                            seq: activity.Seq,
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
            const newVisitTime = prompt("Please enter the Visit Time:", visitTime || new Date().toLocaleTimeString());

            // If the user provides a time, update the state
            if (newVisitTime) {
                setVisitTime(newVisitTime);
            }
            const entryStatus = userID === visitedBy ? "Update" : "Authorize";
            const snqrev = userID === visitedBy ? "" : userID;
            
            const formDetails = {
                branchCode,
                branchName,
                regionName,
                visitDate,
                visitedBy,
                reviewedBy,
                year,
                Entry_Status: entryStatus,
                month,
                MS_Type: "Physical",
                snqrev,
                quarter,
                visitTime: newVisitTime,
                activities: Object.keys(activityState).map((code) => ({
                    Code: code,
                    Status: activityState[code].status,
                    Responsibility: activityState[code].responsibility,
                    Remarks: activityState[code].remarks,
                    Activity: activityState[code].activity,
                    seq: activityState[code].seq,
                    Weightage: activityState[code].weightage,
                    Category: activityState[code].category,
                    Images: activityState[code].image || '',
                })),
            };

            const formData = new FormData();
            formData.append('branchCode', formDetails.branchCode);
            formData.append('branchName', formDetails.branchName);
            formData.append('regionName', formDetails.regionName);
            formData.append('visitDate', formDetails.visitDate);
            formData.append('visitedBy', formDetails.visitedBy);
            formData.append('reviewedBy', formDetails.reviewedBy);
            formData.append('Entry_Status', formDetails.Entry_Status);
            formData.append('MS_Type', formDetails.MS_Type);
            formData.append('year', formDetails.year);
            formData.append('quarter', formDetails.quarter);
            formData.append('month', formDetails.month);
            formData.append('visitTime', formDetails.visitTime);
            formData.append('snqrev', formDetails.snqrev);
            formData.append('activities', JSON.stringify(formDetails.activities)); // Pass the updated activities
            Object.keys(activityState).forEach((code) => {
                const fileInput = document.querySelector(`[data-code="${code}"] .image-upload`);

                if (fileInput && fileInput.files[0]) {
                    // Append the selected image file to FormData
                    formData.append(`Images-${code}`, fileInput.files[0], fileInput.files[0].name);

                }

            });


            try {
                const response = await axios.post('http://localhost:5000/submit-form', formData, {

                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
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

            setImages((prevImages) => ({
                ...prevImages,
                [code]: null,
            }));
            updateActivityState(code, 'image', null);
            setForceUpdate(!forceUpdate);
        };



        return (
            <div className="new-entry-form-container" >
                <div className="form-container" style={{ marginBottom: '5px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="bannerdiv" >
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
                                            label="Reviewed By OM/BM"
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
                            // submitDisabled={submitDisabled}
                            handleImageRemove={handleImageRemove}
                            activityState={activityState}  // Pass the activity state to ActivityForm
                            updateActivityState={updateActivityState}
                            statusOptions={statusOptions}  // Pass status options
                            responsibilityOptions={responsibilityOptions}
                            handleResponsibilityChange={handleResponsibilityChange}
                            isEditForm={true}  // Enable fields for editing
                            visitedBy={visitedBy}
                        />

                    </div>

                )}

            </div>
        );
    };

    export default EditForm;
