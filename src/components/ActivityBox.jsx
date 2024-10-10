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
  setImage, // Persist image
  isNewEntryForm,
  isDisplayReviewForm,
  isEditForm,
  handleImageChange,
  handleImageRemove, // Prop for removing images
}) => {
  const previousStatusStyles = {
    Yes: 'green',
    No: 'red',
    NA: 'yellow',
    NotFound: 'grey',
  };

  const [previousQuarterVisible, setPreviousQuarterVisible] = useState(false);

  const togglePreviousQuarterVisibility = (e) => {
    e.preventDefault();
    setPreviousQuarterVisible(!previousQuarterVisible);
  };

  return (
    <div className="activity-box" data-code={activity.Code}>
      <ActivityDetails
        activity={activity}
        handleStatusChange={setStatus}
        handleImageChange={handleImageChange} // Persist image through onImageChange
        handleImageRemove={handleImageRemove} // Pass image removal function
        togglePreviousQuarterVisibility={togglePreviousQuarterVisibility}
        previousStatusStyles={previousStatusStyles}
        isNewEntryForm={isNewEntryForm}
        isDisplayReviewForm={isDisplayReviewForm}
        isEditForm={isEditForm}
        status={status}
        responsibility={responsibility}
        remarks={remarks}
        handleResponsibilityChange={setResponsibility}
        handleRemarksChange={setRemarks}
        image={image} // Pass the current image
      />
    </div>
  );
};

export default ActivityBox;
