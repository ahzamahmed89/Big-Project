import React from 'react';

const YearDropdown = ({ selectedYear, onYearChange, disabled }) => {
  // Generate year options from 2022 to the current year
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2022 + 1 }, (_, i) => 2022 + i);

  return (
    <div className="form-input">
      <label htmlFor="year">Year</label>
      <select
        id="year"
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        
      >
        {yearOptions.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default YearDropdown;
