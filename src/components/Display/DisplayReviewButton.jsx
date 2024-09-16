import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ReviewButton = ({ data, handleSubmitFormClick }) => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    const fetchReviewStatus = async () => {
      if (!branchCode.value || !year.value || !quarter.value || !month.value) {
        console.error('Missing required fields: Branch_Code, Year, Quarter, or Month');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/check-entry', {
          params: {
            branchCode: branchCode.value,
            year: year.value,
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

    if (branchCode.value && year.value && quarter.value && month.value) {
      fetchReviewStatus();
    }
  }, [data]);

  // Function to handle the review button press
  const handleReviewButtonClick = async () => {
    try {
      // Make a request to update the review status
      const response = await axios.post('http://localhost:5000/update-review-status', {
        branchCode: branchCode.value,
        year: year.value,
        quarter: quarter.value,
        month:month.value
      });

      if (response.data.success) {
        console.log('Review status updated successfully');
        alert('Document successfully reviewed');
        setIsButtonDisabled(true); // Disable the button after updating
      } else {
        console.log('Failed to update review status:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating review status:', error.response ? error.response.status : error.message);
    }
    
  };

  return (
    <button
      type="button"
      className="submit-button"
      onClick={handleReviewButtonClick}
      disabled={isButtonDisabled}
    >
      Reviewed
    </button>
  );
};

export default ReviewButton;
