import React, { useEffect,useState } from 'react';

const ActivityDetails = ({
  activity,
  status,
  handleStatusChange,
  responsibility,
  handleResponsibilityChange,
  remarks,
  image, // Use the image prop passed from the parent
  handleRemarksChange,
  handleImageChange,
  togglePreviousQuarterVisibility,
  previousStatusStyles = { Yes: 'green', No: 'red', NA: 'yellow', NotFound: 'grey' },
  isNewEntryForm,
  isDisplayReviewForm,
  isEditForm,
  handleImageRemove, // New prop for handling image removal
}) => {
  // Status styles
  const statusStyles = {
    Yes: { backgroundColor: 'lightgreen' },
    No: { backgroundColor: 'lightcoral' },
    NA: { backgroundColor: 'rgb(234, 234, 172)' },
  };

  // Clean up object URL when the component unmounts
  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);
  const [isImageRemoved, setIsImageRemoved] = useState(false); // New state

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageChange(file, activity.Code); // Pass the file and activity code to the parent handler
    }
  };

  const onResponsibilityChange = (e) => {
    handleResponsibilityChange(e.target.value, activity.Code); // Pass responsibility and activity code
  };

  const onStatusChange = (e) => {
    handleStatusChange(e.target.value, activity.Code); // Ensure correct activity.Code is passed
  };
  

  const currentImagePath = activity.Images
    ? `/images/${activity.Images.split('Images\\')[1]?.replace(/\\/g, '/')}`
    : null;
    
    const handleImageRemoveClick = (e) => {
      e.preventDefault(); // Prevent form submit or page refresh
  e.stopPropagation(); // Stop the event from bubbling up
  setIsImageRemoved(true);
      handleImageRemove(activity.Code); // Call the function to remove the image
    };
  return (
    <div className="activity-details">
      <h3
        className="activity"
        style={{ ...statusStyles[status], padding: '6px', fontWeight: 'bold' }}
      >
        {activity.Activity}
      </h3>

      {/* Status Section */}
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

      {/* Responsibility Section */}
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

      {/* Image Upload for New Entry Form */}
      {isNewEntryForm && (
        <div className="image-upload-section">
          <label>Upload Image:</label>
          <input type="file" className="image-upload" onChange={onImageChange} />
          {image && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={URL.createObjectURL(image)} alt="Uploaded Preview" className="image-preview" />
              <button className="remove-image-cross" onClick={handleImageRemoveClick}>
                &times;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image Handling for Edit Form */}
      {isEditForm && (
  <div className="image-upload-section">
    <label>Upload Image:</label>
    <input type="file" className="image-upload" onChange={onImageChange} />
    {currentImagePath && !isImageRemoved? (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img src={currentImagePath} alt="Image for this activity." className="image-preview" />
        <button className="remove-image-cross" onClick={handleImageRemoveClick}>
          &times;
        </button>
      </div>
    ) : image ? ( // If there is no currentImagePath, but an image has been selected
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img src={URL.createObjectURL(image)} alt="Uploaded Preview" className="image-preview" />
        <button className="remove-image-cross" onClick={handleImageRemoveClick}>
          &times;
        </button>
      </div>
    ) : (
      <p>No image available, please upload a new one.</p>
    )}
  </div>
)}


    </div>
  );
};

export default ActivityDetails;
