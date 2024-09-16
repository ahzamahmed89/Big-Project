import React from 'react';
import CategorySection from './DisplayCategorySection';
import ReviewButton from './DisplayReviewButton'; // Import the ReviewButton component

const ActivityForm = ({ data, handleSubmitFormClick }) => {
  console.log('Data prop:', data);

  return (
    <form id="activityForm" style={{ width: '100%' }}>
      {Object.keys(data).length > 0 &&
        Object.keys(data).map((category) => (
          <CategorySection
            key={category}
            category={category}
            activities={data[category]}
          />
        ))
      }
      <input
        type="text"
        value={data.Reviewed_By || ''}
        readOnly
      />
      <ReviewButton data={data} handleSubmitFormClick={handleSubmitFormClick} />
    </form>
  );
};

export default ActivityForm;
