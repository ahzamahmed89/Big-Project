import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const TrEntryTable = ({ physicalData }) => {
  const navigate = useNavigate();

  // Handle row click
  const handleRowClick = (transaction) => {
    console.log('Row clicked:', transaction);
    if (transaction.highlight) {
      navigate('/transaction-feedback', {
        state: { selectedTransaction: transaction },
      });
    }
};

  return (
    <div className="entrytable">
      <h2>Transactional Entry Data</h2>
      <table className="trdata-table">
        <thead>
          <tr>
            <th>Branch Code</th>
            <th>Branch Name</th>
            <th>Region Name</th>
            <th>Visit Year</th>
            <th>Quarter</th>
            <th>Visit Month</th>
            <th>Last Edit By</th>
            <th>Last Edit Date</th>
          </tr>
        </thead>
        <tbody>
          {physicalData.map((entry) => (
            <tr
              key={entry.Branch_Code}
              className={`table-row ${entry.highlight ? 'highlight' : ''}`}
              onClick={() => handleRowClick(entry)}
              style={{ backgroundColor: entry.highlight ? '#f8d7da' : '' }}
            >
              <td>{entry.Branch_Code}</td>
              <td>{entry.Branch_Name}</td>
              <td>{entry.Region_Name}</td>
              <td>{entry.Year}</td>
              <td>{entry.Qtr}</td>
              <td>{entry.Month}</td>
              <td>{entry.Last_Edit_By}</td>
              <td>{entry.Last_Edit_Date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TrEntryTable.propTypes = {
  physicalData: PropTypes.arrayOf(
    PropTypes.shape({
      Branch_Code: PropTypes.string,
      Branch_Name: PropTypes.string,
      Region_Name: PropTypes.string,
      Year: PropTypes.number,
      Qtr: PropTypes.string,
      Month: PropTypes.string,
      Last_Edit_By: PropTypes.string,
      Last_Edit_Date: PropTypes.string,
      highlight: PropTypes.bool,
    })
  ).isRequired,
};

export default TrEntryTable;
