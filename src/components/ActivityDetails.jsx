import React, { useEffect, useState } from 'react';
import ImageUploadComponent from './ImageCapture'; // Importing the image upload component

const ActivityDetails = ({
  activity,
  status,
  handleStatusChange,
  responsibility,
  handleResponsibilityChange,
  remarks,
  image, // Image prop passed from parent
  handleRemarksChange,
  handleImageChange,
  togglePreviousQuarterVisibility,
  previousStatusStyles = { Yes: 'green', No: 'red', NA: 'yellow', NotFound: 'grey' },
  isNewEntryForm,
  isDisplayReviewForm,
  isEditForm,
  handleImageRemove, // Prop for handling image removal
}) => {
  const statusStyles = {
    Yes: { backgroundColor: 'lightgreen' },
    No: { backgroundColor: 'lightcoral' },
    NA: { backgroundColor: 'rgb(234, 234, 172)' },
  };

  const [isImageRemoved, setIsImageRemoved] = useState(false);

  // Clean up object URLs when the component unmounts
  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const onImageChange = (file) => {
    handleImageChange(file, activity.Code); // Pass file and activity code to parent
  };

  const onResponsibilityChange = (e) => {
    handleResponsibilityChange(e.target.value, activity.Code); // Pass responsibility and activity code
  };

  const onStatusChange = (e) => {
    handleStatusChange(e.target.value, activity.Code); // Pass status and activity code
  };

  const currentImagePath = activity.Images
    ? `/images/${activity.Images.split('Images\\')[1]?.replace(/\\/g, '/')}`
    : null;

  const handleImageRemoveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageRemoved(true);
    handleImageRemove(activity.Code); // Trigger image removal logic
  };

  return (
    <div className="activity-details">
      {/* Activity Header */}
      <h3
        className="activity"
        style={{ ...statusStyles[status], padding: '6px', fontWeight: 'bold' }}
      >
        {activity.Activity}
      </h3>

      {/* Status Selection */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <label>Status:</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <select
            className="status"
            value={status}
            onChange={onStatusChange}
            disabled={isDisplayReviewForm}
            style={{ textAlign: 'center' }}
          >
            <option value="">Select Status</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="NA">NA</option>
          </select>
          <button
            className="previous-quarter-button"
            onClick={togglePreviousQuarterVisibility}
            style={{
              backgroundColor: previousStatusStyles[activity.PreviousQuarterData?.Status || 'NotFound'],
              cursor: 'pointer',
            }}
          >
            &#x1F50D;
          </button>
        </div>
      </div>

      {/* Responsibility Selection */}
      <div>
        <label>Responsibility:</label>
        <select
          className="responsibility"
          value={responsibility}
          onChange={onResponsibilityChange}
          disabled={isDisplayReviewForm}
        >
          <option value="">Select Responsibility</option>
          <option value="Admin">Admin</option>
          <option value="Branch Operations">Branch Operations</option>
          <option value="IT">IT</option>
          <option value="Marketing">Marketing</option>
          <option value="HR">HR</option>
          <option value="Business">Business</option>
          <option value="Others">Others</option>
        </select>
      </div>

      {/* Remarks Input */}
      <div>
        <label>Remarks:</label>
        <input
          type="text"
          className="remarks"
          placeholder="Enter Remarks"
          value={remarks}
          onChange={(e) => handleRemarksChange(e.target.value)}
          disabled={isDisplayReviewForm}
        />
      </div>

      {/* Use ImageUploadComponent for Image Upload */}
      <ImageUploadComponent
        image={image}
        onImageChange={onImageChange}
        onImageRemove={handleImageRemoveClick}
        isNewEntryForm={isNewEntryForm}
        isEditForm={isEditForm}
        currentImagePath={currentImagePath}
        isImageRemoved={isImageRemoved}
        setIsImageRemoved={setIsImageRemoved}
        handleImageRemove={handleImageRemove}
      />
    </div>
  );
};

export default ActivityDetails;
