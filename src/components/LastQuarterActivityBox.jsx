import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LastQuarterActivityBox = ({ branchCode, year, quarter, currentData }) => {
  const [lastQuarterData, setLastQuarterData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastQuarterData = async () => {
      try {
        const lastQuarter = quarter === 'Q1' ? 'Q4' : `Q${parseInt(quarter[1], 10) - 1}`;
        const lastYear = quarter === 'Q1' ? year - 1 : year;
        const response = await axios.get(`http://localhost:5000/get-last-quarter-data?branchCode=${branchCode}&year=${lastYear}&quarter=${lastQuarter}`);
        setLastQuarterData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching last quarter data:', error);
        setLoading(false);
      }
    };

    fetchLastQuarterData();
  }, [branchCode, year, quarter]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {lastQuarterData.map((activity, index) => (
        <div key={index} className="activity-box" style={{ borderColor: getStatusColor(activity.Status) }}>
          <h3>{activity.Activity}</h3>
          <div>Status: {activity.Status}</div>
          <div>Responsibility: {activity.Responsibility}</div>
          <div>Remarks: {activity.Remarks}</div>
          {activity.Image && <img src={activity.Image} alt="Activity" />}
        </div>
      ))}
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Yes':
      return 'green';
    case 'No':
      return 'red';
    case 'NA':
    default:
      return 'yellow';
  }
};

export default LastQuarterActivityBox;
