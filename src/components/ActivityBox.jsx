import React, { useState, useEffect } from 'react';

const ActivityBox = ({ activity }) => {
  const statusStyles = {
    Yes: { backgroundColor: 'lightgreen' },
    No: { backgroundColor: 'lightcoral' },
    NA: { backgroundColor: 'rgb(234, 234, 172)' },
  };

  const previousStatusStyles = {
    Yes: 'green',
    No: 'red',
    NA: 'yellow',
    NotFound: 'yellow'
  };

  const [status, setStatus] = useState(activity.Status);
  const [image, setImage] = useState(null);
  const [previousQuarterVisible, setPreviousQuarterVisible] = useState(false);

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const togglePreviousQuarterVisibility = (e) => {
    e.preventDefault();
    setPreviousQuarterVisible(!previousQuarterVisible);
  };

  const imagePath = activity.PreviousQuarterData?.Images
    ? `/images/${activity.PreviousQuarterData.Images.split('Images\\')[1].replace(/\\/g, '/')}`
    : null;
    console.log('Image Path:', imagePath);
  return (
    <div className="activity-box" data-code={activity.Code}>
      <h3 className="activity" style={{ ...statusStyles[status], padding: '6px', fontWeight: 'bold' }}>
        {activity.Activity}
      </h3>
      <div>
        <label>Status:</label>
        <select className="status" value={status} onChange={handleStatusChange}>
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
          }}
        >
          &#x1F50D;
        </button>
      </div>
      <div>
        <label>Responsibility:</label>
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
        <label>Remarks:</label>
        <input
          type="text"
          className="remarks"
          placeholder="Enter Remarks"
          defaultValue={activity.Remarks}
        />
      </div>
      <div>
        <label>Image:</label>
        <input type="file" className="image-upload" onChange={handleImageChange} />
        {image && <img src={image} alt="Uploaded Preview" className="image-preview" />}
      </div>
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
            
          )}</div>
        </div>
      )}
    </div>
  );
};

export default ActivityBox;
