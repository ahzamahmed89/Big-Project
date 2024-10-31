import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../components/UserContext';
import '../App.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUserID } = useContext(UserContext);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both User ID and password');
    } else {
      setError('');
      setUserID(email); // Set User ID in context and localStorage
      navigate('/home'); // Navigate on successful login
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Sign-In</h2>
        {error && <p className="error">{error}</p>}
        <div className="input-group">
          <label htmlFor="email">User ID</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your User ID"
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" className="login-btn">Log In</button>
      </form>
    </div>
  );
}

export default LoginPage;
