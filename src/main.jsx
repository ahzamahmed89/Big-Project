import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot instead of ReactDOM
import './index.css';
import App from './App.jsx';

const root = createRoot(document.getElementById('root')); // Create a root for the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
