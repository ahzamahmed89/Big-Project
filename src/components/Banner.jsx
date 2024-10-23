import React from 'react';

const FeatureItem = ({  title, description, accentColor }) => {
  return (
    <ul className="banner">
      <li style={{ '--accent-color': accentColor }}>
       
        <div className="title">{title}</div>
        <div className="descr">{description}</div>
      </li>
    </ul>
  );
};

export default FeatureItem;
