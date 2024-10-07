import React from 'react';
import './App.css';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Carousel from './components/Carousel';
import NewEntryForm from './pages/NewEntryForm.jsx';
import DisplayReviewForm from './pages/DisplayReviewForm';
import EditForm from './pages/EditForm';  // Import EditForm
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Sidebar />
        <Routes>
          <Route path="/newentry" element={<NewEntryForm />} />
          <Route path="/display-review" element={<DisplayReviewForm />} />
          <Route path="/edit" element={<EditForm />} /> {/* Add route for EditForm */}
          <Route path="/" element={<Carousel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
