import React from 'react';
import CategorySection from './DisplayCategorySection';

const ActivityForm = ({ data, handleSubmitFormClick, submitDisabled }) => (
  <form id="activityForm">
    {Object.keys(data).length > 0 && (
      Object.keys(data).map((category) => (
        <CategorySection
          key={category}
          category={category}
          activities={data[category]}
        />
      ))
    )}
    <button
      type="button"
      className="submit-button"
      onClick={handleSubmitFormClick}
      disabled={submitDisabled}
    >
      Reviewed
    </button>
  </form>
);

export default ActivityForm;
