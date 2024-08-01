import React, { useState, useEffect } from 'react'; // Ensure useEffect is imported


const ActivityBox = ({ activity }) => {
  const statusStyles = {
    Yes: { backgroundColor: 'lightgreen' },
    No: { backgroundColor: 'lightcoral' },
    NA: { backgroundColor: 'lightyellow' },
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  return (
    <div className="activity-box"  data-code={activity.Code}>
      <h3 className="activity" style={{...statusStyles[status], padding:'6px', fontWeight:'bold'}}>{activity.Activity}</h3>
      <div>
        <label>Status:</label>
        <select className="status" value={status} onChange={handleStatusChange}>
          <option value="">Select Status</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="NA">NA</option>
        </select>
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
        <input type="file" className="image-upload" onChange={handleImageChange} />
        {image && <img src={image} alt="Uploaded Preview" className="image-preview" />}
      </div>
    </div>
  );
};

export default ActivityBox;
