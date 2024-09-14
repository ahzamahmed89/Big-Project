import React, { useState, useEffect } from 'react';
import CategorySection from './DisplayCategorySection';
import axios from 'axios';

const ActivityForm = ({ data, handleSubmitFormClick }) => {
  console.log('Data prop:', data);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // Fetch the review status from the server based on branch code, year, quarter, etc.
  useEffect(() => {
    
    const fetchReviewStatus = async () => {
      if (!branchCode.value || !year.value || !quarter.value || !month.value) {
        console.error('Missing required fields: Branch_Code, Year, or Qtr');
        return;
      }
  
      try {
        
        const response = await axios.get('http://localhost:5000/check-entry', {
  params: {
    branchCode: branchCode.value,
    year: parseInt(year.value,10),
    quarter: quarter.value,
    month: month.value
  }
});

  
        console.log('API Response:', response.data);
  
        if (response.data.success) {
          const reviewStatus = response.data.reviewStatus;
          console.log('Review Status:', reviewStatus);
  
          setIsButtonDisabled(reviewStatus === 'Yes');
        } else {
          console.log('No data found for the provided criteria.');
        }
      } catch (error) {
        console.error('Error fetching review status:', error.response ? error.response.status : error.message);
      }
    };
  
    if ( branchCode.value && year.value && quarter.value && month.value) {
      fetchReviewStatus();
    }
  }, [data]);

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
      <button
        type="button"
        className="submit-button"
        onClick={handleSubmitFormClick}
        disabled={isButtonDisabled}
      >
        Reviewed
      </button>
    </form>
  );
};

export default ActivityForm;
