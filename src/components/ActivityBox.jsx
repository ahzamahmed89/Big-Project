import React, { useState } from 'react';
import ActivityDetails from './ActivityDetails';

const ActivityBox = ({ 
  activity, 
  status, 
  setStatus, 
  responsibility, 
  setResponsibility, 
  remarks, 
  setRemarks, 
  image, 
  setImage,  // Persist image
  isNewEntryForm, 
  isDisplayReviewForm, 
  handleImageChange 
}) => {
  const previousStatusStyles = {
    Yes: 'green',
    No: 'red',
    NA: 'yellow',
    NotFound: 'grey',
  };

  const [previousQuarterVisible, setPreviousQuarterVisible] = useState(false);

  // Log image for debugging
  

  const togglePreviousQuarterVisibility = (e) => {
    e.preventDefault();
    setPreviousQuarterVisible(!previousQuarterVisible);  
  };

  const imagePath = activity.PreviousQuarterData?.Images
  ? `/images/${activity.PreviousQuarterData.Images.split('Images\\')[1]?.replace(/\\/g, '/')}`
  : null;





  // Handle image change
  const onImageChange = (file) => {
    setImage(file);  // Update the current image in the state
    handleImageChange(file, activity.Code);  // Call global handler to manage the image state
  };

  return (
    <div className="activity-box" data-code={activity.Code}>
      <ActivityDetails
        activity={activity}
        handleStatusChange={setStatus}
        handleImageChange={onImageChange}  // Persist image through onImageChange
        togglePreviousQuarterVisibility={togglePreviousQuarterVisibility}  
        previousStatusStyles={previousStatusStyles}
        isNewEntryForm={isNewEntryForm}            
        isDisplayReviewForm={isDisplayReviewForm} 
        status={status}
        responsibility={responsibility}
        remarks={remarks}
        handleResponsibilityChange={setResponsibility}
        handleRemarksChange={setRemarks}
        image={image}  // Pass the current image
      />

      {previousQuarterVisible && activity.PreviousQuarterData && (
        <div className="previous-quarter-data">
          <h6>Last Visit Status</h6>
          <p className="prev-activity">{activity.Activity}</p>
          <p className="prev-status">Status: {activity.PreviousQuarterData.Status}</p>
          <p className="prev-responsibility">Responsibility: {activity.PreviousQuarterData.Responsibility}</p>
          <p className="prev-remarks">Remarks: {activity.PreviousQuarterData.Remarks}</p>
          <div className="prev-img">
            {imagePath && (
              <img
                src={imagePath}
                alt="Previous Quarter"
                className="image-preview"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityBox;
