import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Pour la redirection

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // Pour les messages d'erreur/succès
  const navigate = useNavigate(); // Hook pour la redirection

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // API Register
      const response = await axios.post('/api/register', {
        username,
        email,
        password
      });

      setMessage(response.data.message || 'Compte créé ! Redirection...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setMessage(error.response.data.message || 'Une erreur est survenue.');
    }
  };

  return (
    <div>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom d'utilisateur:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Mot de passe:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">S'inscrire</button>
      </form>
      {/* Affiche le message de succès ou d'erreur */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default RegisterPage;