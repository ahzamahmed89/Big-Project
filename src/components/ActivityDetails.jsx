import React, { useState, useEffect } from 'react';

const ActivityDetails = ({ activity, handleStatusChange, handleImageChange, togglePreviousQuarterVisibility, previousStatusStyles }) => {
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

  return (
    <div>
      <h3 className="activity" style={{ ...statusStyles[status], padding: '6px', fontWeight: 'bold' }}>
        {activity.Activity}
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <label style={{ marginRight: '0px' }}>Status:</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <select className="status" value={status} onChange={onStatusChange} style={{ textAlign: 'center' }}>
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
      <div>
        <label></label>
        <select className="responsibility" defaultValue={activity.Responsibility}>
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
      <div>
        <label></label>
        <input
          type="text"
          className="remarks"
          placeholder="Enter Remarks"
          defaultValue={activity.Remarks}
        />
      </div>
      <div>
        <label>Image:</label>
        <input 
          type="file" 
          className="image-upload" 
          onChange={onImageChange} 
        />
        {image && <img src={image} alt="Uploaded Preview" className="image-preview" />}
      </div>
    </div>
  );
};

export default ActivityDetails;
