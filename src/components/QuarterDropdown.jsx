import React from 'react';

const QuarterDropdown = ({ selectedQuarter, onQuarterChange, disabled }) => {
  const quarters = ["Q1", "Q2", "Q3", "Q4"];

  return (
    <div className="form-group small-input">
      <label htmlFor="quarter">Quarter</label>
      <select
        id="quarter"
        value={selectedQuarter}
        onChange={(e) => onQuarterChange(e.target.value)}
        
      >
        {quarters.map((quarter) => (
          <option key={quarter} value={quarter}>
            {quarter}
          </option>
        ))}
      </select>
    </div>
  );
};

export default QuarterDropdown;
