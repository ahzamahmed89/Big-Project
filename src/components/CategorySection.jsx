import React from 'react';
import ActivityBox from './ActivityBox';

const CategorySection = ({ category, activities=[]  , isNewEntryForm, isDisplayReviewForm, handleImageChange }) => {
  return (
    <div className="category-section">
      <h2 className="category-header">{category}</h2>
      
      <div className="activities-container">
        {activities.length > 0 ? (
          activities.map((activity) => {
             // Check if activity has the properties you expect
            return (
              <ActivityBox
                key={activity.Code}  // Assuming each activity has a unique Code
                activity={activity}
                isNewEntryForm={isNewEntryForm}
                isDisplayReviewForm={isDisplayReviewForm}
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
