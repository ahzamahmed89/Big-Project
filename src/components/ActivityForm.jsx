import React from 'react';
import CategorySection from './CategorySection';
import ReviewButton from './ReviewButton';

const ActivityForm = ({ data, handleSubmitFormClick, submitDisabled, isNewEntryForm, isDisplayReviewForm, handleImageChange }) => {
  return (
    <form id="activityForm" style={{ width: '100%' }}>
      {Object.keys(data).length > 0 ? (
        Object.keys(data).map((category) => (
          <CategorySection
            key={category}
            category={category}
            activities={data[category]} // Ensure this is the filtered data
            isNewEntryForm={isNewEntryForm}
            isDisplayReviewForm={isDisplayReviewForm}
            handleImageChange={handleImageChange}
          />
        ))
      ) : (
        <p>No activities available to display.</p> // Fallback when there's no data
      )}

      {/* Conditionally render the submit button or other buttons */}
      {!isDisplayReviewForm && (
        <button
          type="button"
          className="submit-button"
          onClick={handleSubmitFormClick}
          disabled={submitDisabled}
        >
          Submit
        </button>
      )}

      {/* Render the ReviewButton */}
      
    </form>
  );
};

export default ActivityForm;