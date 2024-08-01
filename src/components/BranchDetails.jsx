import React, { useState } from 'react';
import axios from 'axios';
import FormInput from './FormInput';

const BranchDetails = ({ branchCode, setBranchCode, setBranchName, setRegionName, setFormDisabled, formGenerated }) => {
  const [localBranchName, setLocalBranchName] = useState('');
  const [localRegionName, setLocalRegionName] = useState('');

  const handleBranchCodeChange = (e) => {
    const code = e.target.value.trim();
    setBranchCode(code);

    if (code && code.length === 3) {
      axios.get(`http://localhost:5000/branch/${code}`)
        .then(response => {
          const data = response.data;
          if (data.success) {
            setLocalBranchName(data.data.Branch_Name);
            setLocalRegionName(data.data.Region);
            setBranchName(data.data.Branch_Name);
            setRegionName(data.data.Region);
            setFormDisabled(false);
          } else {
            setLocalBranchName("Branch not found");
            setLocalRegionName("");
            setFormDisabled(true);
          }
        })
        .catch(error => {
          console.error('Fetch error:', error);
          alert('An error occurred while fetching branch details. Please try again.');
          setFormDisabled(true);
        });
    } else {
      setLocalBranchName("");
      setLocalRegionName("");
      setFormDisabled(true);
    }
  };

  return (
    <div className="form-row">
      <div className="form-group small-input">
        <label htmlFor="branchCode">Branch Code</label>
        <input
          type="text"
          id="branchCode"
          value={branchCode}
          onChange={handleBranchCodeChange}
          required
          disabled={formGenerated}
        />
      </div>
      <FormInput
        label="Branch Name"
        type="text"
        id="branchName"
        value={localBranchName}
        readOnly={true}
        disabled={formGenerated}
      />
      <FormInput
        label="Region"
        type="text"
        id="regionName"
        value={localRegionName}
        readOnly={true}
        disabled={formGenerated}
      />
    </div>
  );
};

export default BranchDetails;
