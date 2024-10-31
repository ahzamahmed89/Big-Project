// UserContext.js
import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userID, setUserID] = useState(() => {
    // Check if there's a saved userID in localStorage
    return localStorage.getItem('userID') || '';
  });
console.log(userID)
  // Update localStorage whenever userID changes
  useEffect(() => {
    if (userID) {
      localStorage.setItem('userID', userID);
    } else {
      localStorage.removeItem('userID'); // Clear it if user logs out
    }
  }, [userID]);

  return (
    <UserContext.Provider value={{ userID, setUserID }}>
      {children}
    </UserContext.Provider>
  );
};
