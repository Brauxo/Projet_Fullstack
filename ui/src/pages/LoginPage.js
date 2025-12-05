import React, { useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom'; 
import './Form.css'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // API Login
      const response = await api.post('/api/login', {
        email,
        password
      });

      localStorage.setItem('token', response.data.access_token);
      window.location.href = '/';

    } catch (error) {
      setMessage(error.response.data.message || 'Email ou mot de passe incorrect.');
    }
  };


  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Connexion</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email:</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe:</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-button">Se connecter</button>
        </form>
        {message && <p className="form-message">{message}</p>}
        
        <div className="form-switch-link">
          Pas encore de compte ? <Link to="/register">Inscrivez-vous</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;