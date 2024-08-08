import React from 'react';
import './App.css';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Carousel from './components/Carousel';
import NewEntryForm from './components/NewEntryForm.jsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
// import ActivityDashboard from './components/ActivityDashboard'; // Import the new component

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Sidebar />
        <Routes>
          <Route path="/newentry" element={<NewEntryForm />} />
          <Route path="/" element={<Carousel />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
