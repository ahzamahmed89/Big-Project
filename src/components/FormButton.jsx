import React from 'react';

const FormButton = ({ onClick, disabled, label }) => (
  <button
    type="button"
    className="generate-form-button"
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
);

export default FormButton;
