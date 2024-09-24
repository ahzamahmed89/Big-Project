import React, { useState, useEffect } from 'react';

const ActivityDetails = ({ 
  activity, 
  handleStatusChange, 
  handleImageChange, 
  togglePreviousQuarterVisibility, 
  previousStatusStyles = { Yes: 'green', No: 'red', NA: 'yellow', NotFound: 'yellow' }, // Ensure NotFound is always present
  isNewEntryForm,       // Prop to indicate if it's NewEntryForm
  isDisplayReviewForm   // Prop to indicate if it's DisplayReviewForm
}) => {
  const statusStyles = {
    Yes: { backgroundColor: 'lightgreen' },
    No: { backgroundColor: 'lightcoral' },
    NA: { backgroundColor: 'rgb(234, 234, 172)' },
  };

  const [status, setStatus] = useState(activity.Status);
  const [image, setImage] = useState(null);

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const onStatusChange = (e) => {
    setStatus(e.target.value);
    handleStatusChange(e.target.value);
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      handleImageChange(file, activity.Code); // Pass the file and activity code to the parent handler
    }
  };

  // Construct image path from activity data (assuming image paths are stored correctly in activity.Images)
  const currentImagePath = activity.Images 
  
  ? `/images/${activity.Images.split('Images\\')[1]?.replace(/\\/g, '/')}`
  : null;

  

  return (
    <div className="activity-details">
      <h3 className="activity" style={{ ...statusStyles[status], padding: '6px', fontWeight: 'bold' }}>
        {activity.Activity}
      </h3>

      {/* Status Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <label>Status:</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <select className="status" value={status} onChange={onStatusChange} disabled={isDisplayReviewForm} style={{ textAlign: 'center' }}>
            <option value="">Select Status</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="NA">NA</option>
          </select>
          <button
            className="previous-quarter-button"
            onClick={togglePreviousQuarterVisibility}
            style={{
              backgroundColor: previousStatusStyles[activity.PreviousQuarterData?.Status || 'NotFound'], // Ensure fallback is 'NotFound'
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
        <select className="responsibility" defaultValue={activity.Responsibility} disabled={isDisplayReviewForm}>
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
          defaultValue={activity.Remarks}
          disabled={isDisplayReviewForm}
        />
      </div>

      {/* Image Handling: Capture for New Entry Form */}
      {isNewEntryForm && (
        <div className="image-upload-section">
          <label></label>
          <input 
            type="file" 
            className="image-upload" 
            onChange={onImageChange} 
          />
          {image && <img src={image} alt="Uploaded Preview" className="image-preview" />}
        </div>
      )}

      {/* Image Handling: Display for Display Review Form */}
      {isDisplayReviewForm && (
        
        <div className="image-display-section">
          
          {currentImagePath ? (
            <img src={currentImagePath} alt="No image available for this activity." className="image-preview" />
          ) : (
            <p>No image available for this activity.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityDetails;
