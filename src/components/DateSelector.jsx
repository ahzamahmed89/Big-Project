import React, { useEffect } from 'react';

const DateSelector = ({ id, value, onChange, minDate, maxDate }) => {
  useEffect(() => {
    const visitDateInput = document.getElementById(id);
    visitDateInput.min = minDate;
    visitDateInput.max = maxDate;
  }, [id, minDate, maxDate]);

  return (
    <div className="form-group">
      <label htmlFor={id}>Visit Date</label>
      <input
        type="date"
        id={id}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
};

export default DateSelector;
