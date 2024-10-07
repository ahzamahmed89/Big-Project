import React, { useMemo } from 'react';
import ActivityBox from './ActivityBox';

const CategorySection = ({ 
  category, 
  activities = [], 
  activityState, 
  updateActivityState, 
  isNewEntryForm, 
  isDisplayReviewForm, 
  handleImageChange 
}) => {
  // Memoize activities to avoid unnecessary re-renders
  const memoizedActivities = useMemo(() => activities, [activities]);

  return (
    <div className="category-section">
      <h2 className="category-header">{category}</h2>

      <div className="activities-container">
        {memoizedActivities.length > 0 ? (
          memoizedActivities.map((activity) => {
            const activityDetails = activityState[activity.Code] || {
              status: activity?.PreviousQuarterData?.Status || '',
              responsibility: activity?.PreviousQuarterData?.Responsibility || '',
              remarks: activity?.PreviousQuarterData?.Remarks || '',
              image: activity?.PreviousQuarterData?.Images || '',
            };

            return (
              <ActivityBox
                key={activity.Code}
                activity={activity}
                isNewEntryForm={isNewEntryForm}
                isDisplayReviewForm={isDisplayReviewForm}
                status={activityDetails.status}
                setStatus={(newStatus) => updateActivityState(activity.Code, 'status', newStatus)}
                responsibility={activityDetails.responsibility}
                setResponsibility={(newResponsibility) => updateActivityState(activity.Code, 'responsibility', newResponsibility)}
                remarks={activityDetails.remarks}
                setRemarks={(newRemarks) => updateActivityState(activity.Code, 'remarks', newRemarks)}
                image={activityDetails.image}
                setImage={(newImage) => updateActivityState(activity.Code, 'image', newImage)}
                handleImageChange={handleImageChange}
              />
            );
          })
        ) : (
          <p>No activities found in this category.</p>
        )}
      </div>
    </div>
  );
};

export default CategorySection;
