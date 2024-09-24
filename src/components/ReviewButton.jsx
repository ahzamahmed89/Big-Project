import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ReviewButton = ({ branchCode, year, quarter, month, handleSubmitFormClick }) => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    const fetchReviewStatus = async () => {
      if (!branchCode || !year || !quarter || !month) {
        console.error('Missing required fields: Branch_Code, Year, Quarter, or Month');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/check-entry', {
          params: {
            branchCode: branchCode,
            year: year,
            quarter: quarter,
            month: month,
          }
        });

        console.log('API Response:', response.data);

        if (response.data.success) {
          const reviewStatus = response.data.reviewStatus;
          console.log('Review Status:', reviewStatus);

          // Enable the button if the reviewStatus is 'No'
          if (reviewStatus === 'No') {
            setIsButtonDisabled(false);
          } else if (reviewStatus === 'Yes') {
            setIsButtonDisabled(true); // Disable the button if review status is 'Yes'
          }
        } else {
          console.log('No data found for the provided criteria.');
        }
      } catch (error) {
        console.error('Error fetching review status:', error.response ? error.response.status : error.message);
      }
    };

    if (branchCode && year && quarter && month) {
      fetchReviewStatus();
    }
  }, [branchCode, year, quarter, month]);

  // Function to handle the review button press
  const handleReviewButtonClick = async () => {
    try {
      const response = await axios.post('http://localhost:5000/update-review-status', {
        branchCode: branchCode,
        year: year,
        quarter: quarter,
        month: month
      });

      if (response.data.success) {
        alert('Document successfully reviewed');
        setIsButtonDisabled(true); // Disable the button after reviewing
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
      disabled={isButtonDisabled} // Button will be disabled based on `isButtonDisabled` state
    >
      Reviewed
    </button>
  );
};

export default ReviewButton;
