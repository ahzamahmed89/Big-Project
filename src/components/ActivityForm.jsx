import React, { useContext } from 'react';
import CategorySection from './CategorySection';
import { UserContext } from '../components/UserContext';

const ActivityForm = ({ data, handleResponsibilityChange, handleImageRemove, handleSubmitFormClick, activityState, updateActivityState,isEditForm, handleImageChange, isNewEntryForm, isDisplayReviewForm, visitedBy }) => {
  const { userID } = useContext(UserContext);
  return (
    <form id="activityForm" style={{ width: '100%' }}>
      {Object.keys(data).length > 0 ? (
      Object.keys(data).map(category => (
        <CategorySection
          key={category}
          category={category}
          activities={data[category]}
          handleImageRemove={handleImageRemove}
          activityState={activityState}  // Pass activityState (including responsibility and remarks)
          updateActivityState={updateActivityState}  // Pass the update function
          isNewEntryForm={isNewEntryForm}
          isDisplayReviewForm={isDisplayReviewForm}
          isEditForm={isEditForm}
          handleImageChange={handleImageChange}
          handleResponsibilityChange={handleResponsibilityChange}
        />
      )) 
      ) : (
        <p>...</p> // Fallback when there's no data
     ) }
     {(!isDisplayReviewForm  && !isNewEntryForm)&&(
        <button
          type="button"
          className="submit-button"
          onClick={handleSubmitFormClick}
          disabled={isDisplayReviewForm}
        >
          {userID === visitedBy ? "Edit" : "Authorize"}
        </button>
      )}
      {(isNewEntryForm && !isDisplayReviewForm)&&(
        <button
          type="button"
          className="submit-button"
          onClick={handleSubmitFormClick}
          disabled={isDisplayReviewForm }
        >
          Submit
        </button>
      )}
    </form>
  );
};

export default ActivityForm;
