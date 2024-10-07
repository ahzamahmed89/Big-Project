import React, { useEffect, useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import '../App.css';

const SearchBar = ({ 
  categories = [], // Default to empty array
  activities = [], // Default to empty array
  selectedCategory, 
  setSelectedCategory, 
  selectedActivity, 
  setSelectedActivity,
  statusOptions = [], // Default to empty array, dynamically passed
  selectedStatus, 
  setSelectedStatus, 
  responsibilityOptions = [], // Default to empty array, dynamically passed
  selectedResponsibility, 
  setSelectedResponsibility 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const searchBarRef = useRef(null);
  const nodeRef = useRef(null); // Added nodeRef

  const handleCategoryChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedCategory(values);
    setSelectedActivity([]); // Reset activities when categories change
  };

  const handleActivityChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedActivity(values);
  };

  const handleStatusChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedStatus(values); // Set the selected status filter
  };
  const handleResponsibilityChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedResponsibility(values); // Set the selected responsibility filter
  
    // Notify parent about the responsibility change (assuming `code` is passed down)
    if (handleResponsibilityChange) {
      values.forEach((responsibility) => {
        handleResponsibilityChange(responsibility, code); // Assuming `code` is known or passed as a prop
      });
    }
  };
  

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Safely map over categories, activities, statusOptions, and responsibilityOptions
  const categoryOptions = categories.map(category => ({ value: category, label: category }));
  const activityOptions = activities.map(activity => ({ value: activity.activity, label: activity.activity, category: activity.category }));
  const filteredActivityOptions = selectedCategory.length === 0 
    ? activityOptions 
    : activityOptions.filter(option => selectedCategory.includes(option.category));

  const statusSelectOptions = statusOptions.map(status => ({ value: status, label: status }));
  const responsibilitySelectOptions = responsibilityOptions.map(resp => ({ value: resp, label: resp }));

  return (
    <Draggable nodeRef={nodeRef}>
      <div className={`search-bar ${isOpen ? 'open' : ''}`} ref={nodeRef}>
        <div className="search-bar-icon" onClick={toggleOpen}>
          <FontAwesomeIcon icon={faSearch} />
        </div>
        {isOpen && (
          <div className="search-bar-content" ref={searchBarRef}>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <Select
                id="category"
                isMulti
                options={categoryOptions}
                value={categoryOptions.filter(option => selectedCategory.includes(option.value))}
                onChange={handleCategoryChange}
                placeholder="Select categories"
              />
            </div>

            <div className="form-group">
              <label htmlFor="activity">Activity</label>
              <Select
                id="activity"
                isMulti
                options={filteredActivityOptions}
                value={filteredActivityOptions.filter(option => selectedActivity.includes(option.value))}
                onChange={handleActivityChange}
                placeholder="Select activities"
              />
            </div>

            {/* Status Filter */}
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <Select
                id="status"
                isMulti
                options={statusSelectOptions}
                value={statusSelectOptions.filter(option => selectedStatus.includes(option.value))}
                onChange={handleStatusChange}
                placeholder="Select status"
              />
            </div>

            {/* Responsibility Filter */}
            <div className="form-group">
              <label htmlFor="responsibility">Responsibility</label>
              <Select
                id="responsibility"
                isMulti
                options={responsibilitySelectOptions}
                value={responsibilitySelectOptions.filter(option => selectedResponsibility.includes(option.value))}
                onChange={handleResponsibilityChange}
                placeholder="Select responsibility"
              />
            </div>
          </div>
        )}
      </div>
    </Draggable>
  );
};

export default SearchBar;
