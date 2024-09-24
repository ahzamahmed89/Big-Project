import React, { useState } from 'react';
import ActivityDetails from './ActivityDetails';

const ActivityBox = ({ activity, isNewEntryForm, isDisplayReviewForm, handleImageChange }) => {
  const previousStatusStyles = {
    Yes: 'green',
    No: 'red',
    NA: 'yellow',
    NotFound: 'yellow',
  };

  const [previousQuarterVisible, setPreviousQuarterVisible] = useState(false);

  const togglePreviousQuarterVisibility = (e) => {
    e.preventDefault();
    setPreviousQuarterVisible(!previousQuarterVisible);
  };

  const handleStatusChange = (newStatus) => {
    // Handle status change logic here, e.g., update status in parent component
  };

  // If activity has previous quarter images, construct the image path
  const imagePath = activity.PreviousQuarterData?.Images
    ? `/images/${activity.PreviousQuarterData.Images.split('Images\\')[1]?.replace(/\\/g, '/')}`
    : null;

  return (
    <div className="activity-box" data-code={activity.Code}>
      <ActivityDetails
        activity={activity}
        handleStatusChange={handleStatusChange}
        handleImageChange={handleImageChange}
        togglePreviousQuarterVisibility={togglePreviousQuarterVisibility}
        previousStatusStyles={previousStatusStyles}
        isNewEntryForm={isNewEntryForm}            
        isDisplayReviewForm={isDisplayReviewForm} 
        
      />
     
      {previousQuarterVisible && activity.PreviousQuarterData && (
        <div className="previous-quarter-data">
          <h6>Last Visit Status</h6>
          <p className='prev-activity'>{activity.Activity}</p>
          <p className='prev-status'>Status: {activity.PreviousQuarterData.Status}</p>
          <p className='prev-responsibility'>Responsibility: {activity.PreviousQuarterData.Responsibility}</p>
          <p className='prev-remarks'>Remarks: {activity.PreviousQuarterData.Remarks}</p>
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
