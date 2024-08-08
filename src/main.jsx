import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot instead of ReactDOM
import './index.css';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';



const root = createRoot(document.getElementById('root')); // Create a root for the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
