import React from 'react';

const FormInput = ({ label, type, id, value, onChange, readOnly, disabled }) => (
  <div className="form-group">
    <label htmlFor={id}>{label}</label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      disabled={disabled}
      required
    />
  </div>
);

export default FormInput;
