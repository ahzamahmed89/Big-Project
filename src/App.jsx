import React from 'react';
import './App.css';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './components/Home.jsx';
import NewEntryForm from './pages/NewEntryForm.jsx';
import DisplayReviewForm from './pages/DisplayReviewForm';
import LoginPage from './pages/LoginPage.jsx';
import { UserProvider } from '../src/components/UserContext.jsx';
import EditForm from './pages/EditForm';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const location = useLocation(); // Get the current route location

  return (
    <UserProvider>
    <div className="App">
      {location.pathname !== '/' && <Header />}
      {location.pathname !== '/' && <Sidebar />}
      
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/newentry" element={<NewEntryForm />} />
        <Route path="/display-review" element={<DisplayReviewForm />} />
        <Route path="/edit" element={<EditForm />} />
        <Route path="/home" element={<Home />} />
      </Routes>
     
    </div>
     </UserProvider>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
