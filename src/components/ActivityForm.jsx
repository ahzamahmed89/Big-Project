import React from 'react';
import CategorySection from './CategorySection';

const ActivityForm = ({ data, handleSubmitFormClick, activityState, updateActivityState, handleImageChange, isNewEntryForm,isDisplayReviewForm }) => {
  return (
    <form id="activityForm" style={{ width: '100%' }}>
      {Object.keys(data).length > 0 ? (
      Object.keys(data).map(category => (
        <CategorySection
          key={category}
          category={category}
          activities={data[category]}
          activityState={activityState}  // Pass activityState (including responsibility and remarks)
          updateActivityState={updateActivityState}  // Pass the update function
          isNewEntryForm={isNewEntryForm}
          isDisplayReviewForm={isDisplayReviewForm}
          handleImageChange={handleImageChange}
        />
      )) 
      ) : (
        <p>No activities available to display.</p> // Fallback when there's no data
     ) }
     {!isDisplayReviewForm && (
        <button
          type="button"
          className="submit-button"
          onClick={handleSubmitFormClick}
          disabled={isDisplayReviewForm}
        >
          Submit
        </button>
      )}
    </form>
  );
};

export default ActivityForm;
