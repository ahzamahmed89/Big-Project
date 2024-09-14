import React, { useState } from 'react';
import ActivityDetails from '../Display/DisplayActivityDetails';


const ActivityBox = ({ activity }) => {
  const statusStyles = {
    Yes: 'green',
    No: 'red',
    NA: 'yellow',
    NotFound: 'yellow',
  };

  const [detailsVisible, setDetailsVisible] = useState(false);

  const toggleDetailsVisibility = (e) => {
    e.preventDefault();
    setDetailsVisible(!detailsVisible);
  };

  const handleStatusChange = (newStatus) => {
    // Handle status change logic here
  };

  // Safely construct the image path only if activity.Images is defined
  const imagePath = activity.Images
    ? `/images/${activity.Year}/${activity.Images.split('Images\\')[1]?.replace(/\\/g, '/')}`
    : null;

  return (
    <div className="activity-box" data-code={activity.Code}>
      <ActivityDetails
        activity={activity}
        handleStatusChange={handleStatusChange}
        toggleDetailsVisibility={toggleDetailsVisibility} // Pass down the toggle function
        statusStyles={statusStyles} // Pass down the styles
      />
      {detailsVisible && (
        <div className="activity-details">
          <p>{activity.Description}</p>
          <p>Status: {activity.Status}</p>
          <p>Responsibility: {activity.Responsibility}</p>
          <p>Remarks: {activity.Remarks}</p>
          {imagePath && (
            <div className="activity-img">
              <img
                src={imagePath}
                alt="Activity"
                className="image-preview"
                style={{ width: '100%', height: 'auto' }} // Ensures the image fits within its container
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityBox;
