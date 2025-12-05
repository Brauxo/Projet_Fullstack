import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom'; 
import './Form.css'; 

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // API Register
      const response = await api.post('/api/register', {
        username,
        email,
        password
      });

      setIsSuccess(true); 
      setMessage(response.data.message || 'Compte créé ! Redirection...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setIsSuccess(false); 
      setMessage(error.response.data.message || 'Une erreur est survenue.');
    }
  };

return (
    <div className="form-container">
      <div className="form-card">
        <h2>Inscription</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nom d'utilisateur:</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
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
          <button type="submit" className="form-button">S'inscrire</button>
        </form>
        {/*Affiche le message de succès ou d'erreur */}
        {message && <p className={`form-message ${isSuccess ? 'success' : ''}`}>{message}</p>}

        <div className="form-switch-link">
          Déjà un compte ? <Link to="/login">Connectez-vous</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;