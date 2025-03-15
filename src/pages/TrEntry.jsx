import React, { useState, useEffect } from 'react';
import axios from 'axios';
import YearDropdown from '../components/YearDropdown';
import QuarterDropdown from '../components/QuarterDropdown';
import FeatureItem from '../components/Banner';
import TrEntryTable from '../components/TrEntryTable';
import '../App.css';

const TrEntry = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [physicalData, setPhysicalData] = useState([]);

  // Array of month options
  const monthOptions = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Determine initial month based on the date
  const calculateInitialMonth = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const is11th = today.getDate() === 11;

    // If today is the 11th, set current month, otherwise set the previous month
    return is11th ? currentMonth : (currentMonth === 0 ? 11 : currentMonth - 1);
  };

  const handleRowClick = (entry) => {
    // Perform any action, e.g., navigate or open a modal with entry details
    console.log("Row clicked:", entry);
    // Example: Navigate to a detailed view page or show a modal
  };
  // Set initial month and quarter on mount
  useEffect(() => {
    const initialMonthIndex = calculateInitialMonth();
    setSelectedMonth(monthOptions[initialMonthIndex]);
  }, []);

  // Update the quarter based on the selected month
  useEffect(() => {
    const monthIndex = monthOptions.indexOf(selectedMonth);
    const quarter =
      monthIndex < 3 ? 'Q1' :
      monthIndex < 6 ? 'Q2' :
      monthIndex < 9 ? 'Q3' : 'Q4';
    setSelectedQuarter(quarter);
  }, [selectedMonth]);

  // Fetch data when year, quarter, and month are selected
  useEffect(() => {
    if (selectedYear && selectedQuarter && selectedMonth) {
      axios.get(`http://localhost:5000/check-logs`, {
        params: {
          year: selectedYear,
          quarter: selectedQuarter,
          month: selectedMonth
        }
      })
      .then(response => {
        console.log("Physical Data received:", response.data.physical);
        setPhysicalData(response.data.physical || []); // Assuming response.data.physical contains the "physical" entries
    console.log(physicalData)  
    })
      .catch(error => { 
        console.error("Error fetching data:", error);
      });
    }
  }, [selectedYear, selectedQuarter, selectedMonth]);

  const handleYearChange = (year) => setSelectedYear(year);
  const handleQuarterChange = (quarter) => setSelectedQuarter(quarter);
  const handleMonthChange = (e) => setSelectedMonth(e.target.value);

  return (
    <div style={{height:"10vh"}}>
    <div className="flexi">
      <div className="bannerdiv">
        <FeatureItem
          title="Transactional Entry Form"
          description="Enter Transactional Entries Here!"
          accentColor="violet"
        />
      </div>

      <div className="dropdown">
        <YearDropdown
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          disabled={false}
        />
        <QuarterDropdown
          selectedQuarter={selectedQuarter}
          onQuarterChange={handleQuarterChange}
          disabled={false}
        />
        <div className="form-input">
          <label htmlFor="month">Month</label>
          <select
            id="month"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            {monthOptions.map((month, index) => (
              <option key={index} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
      </div>
      {/* Render the TrEntryTable component to show physical data */}
      <TrEntryTable physicalData={physicalData} onRowClick={handleRowClick}/>
    </div>
  );
};

export default TrEntry;
