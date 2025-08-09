import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignupPage.css';

function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Signup API endpoint
      const response = await fetch('/api/users/signup/', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, age: parseInt(age) }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Display Django validation error messages
        const errorMessages = Object.values(data).flat().join('\n');
        throw new Error(errorMessages || 'Signup failed.');
      }
      
      alert('Signup successful! Redirecting to the login page.');
      navigate('/login');

    } catch (err) {
      setError(err.message);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page-container">
      <div className="signup-form-wrapper">
        {/* Logo icon for the signup page */}
        <div className="signup-logo">🌱</div>

        <h1 className="signup-title">Sign Up</h1>
        <p className="signup-subtitle">Support your child's growth with ZeroDose.</p>
        
        <form onSubmit={handleSignup} className="signup-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your desired username"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="age">Child's Age (in years)</label>
            <input
              id="age" 
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)} 
              placeholder="Enter numbers only"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="login-link-container">
          <span>Already have an account?</span>
          <button onClick={() => navigate('/login')} className="login-link-button">
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;