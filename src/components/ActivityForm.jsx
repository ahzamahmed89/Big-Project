import React from 'react';
import CategorySection from './CategorySection';

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
      Submit
    </button>
  </form>
);

export default ActivityForm;
