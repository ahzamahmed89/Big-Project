import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import '../App.css';

const SearchBar = ({ categories, activities, selectedCategory, setSelectedCategory, selectedActivity, setSelectedActivity }) => {
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

  const categoryOptions = categories.map(category => ({ value: category, label: category }));
  const activityOptions = activities.map(activity => ({ value: activity.activity, label: activity.activity, category: activity.category }));

  const filteredActivityOptions = selectedCategory.length === 0 
    ? activityOptions 
    : activityOptions.filter(option => selectedCategory.includes(option.category));

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
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: '#ccc',
                    color: '#333'
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: '#333'
                  }),
                  multiValue: (base) => ({
                    ...base,
                    color: '#333'
                  })
                }}
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
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: '#ccc',
                    color: '#333'
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: '#333'
                  }),
                  multiValue: (base) => ({
                    ...base,
                    color: '#333'
                  })
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Draggable>
  );
};

export default SearchBar;
