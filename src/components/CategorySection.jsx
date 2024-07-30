import React from 'react';
import ActivityBox from './ActivityBox';
import '../App.css';

const CategorySection = ({ category, activities }) => {
  return (
    <div>
      <h2 className="category-header">{category}</h2>
      <div className="activities-container">
        {activities.map((activity) => (
          <ActivityBox key={activity.Code} activity={activity} />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;