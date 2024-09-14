import React, { useState } from 'react';

const ActivityDetails = ({ activity, handleStatusChange, togglePreviousQuarterVisibility, previousStatusStyles }) => {
  const statusStyles = {
    Yes: { backgroundColor: 'lightgreen' },
    No: { backgroundColor: 'lightcoral' },
    NA: { backgroundColor: 'rgb(234, 234, 172)' },
  };

  const [status, setStatus] = useState(activity.Status);

  
  // Adjust path construction based on what the Images field contains
  const imagePath = activity.Images
    ? `/images/${activity.Year}/${activity.Images.split('\\').pop().replace(/\\/g, '/')}`
    : null;

  
  return (
    <div>
      <h3 className="activity" style={{ ...statusStyles[status], padding: '6px', fontWeight: 'bold' }}>
        {activity.Activity}
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <label className="status" style={{ marginRight: '0px' }}>Status: {status}</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          
        </div>
      </div>
      <div>
        <label className="responsibility">Responsibility: {activity.Responsibility}</label>
      </div>
      <div>
        <label className="remarks">Remarks: {activity.Remarks}</label>
      </div>
      <div>
        <label>Image:</label>
        {imagePath && <img src={imagePath} alt="Activity" className="image-preview" style={{ width: '100%', height: 'auto' }} />}
      </div>
    </div>
  );
};

export default ActivityDetails;
