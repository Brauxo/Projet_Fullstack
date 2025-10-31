import React, { useState } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';

function CreateThreadPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title || !content) {
      setMessage('Le titre et le contenu ne peuvent pas être vides.');
      return;
    }

    try {
      await api.post('/api/threads', {
        title,
        content
      });

      navigate('/');

    } catch (error) {
      setMessage(error.response.data.message || 'Une erreur est survenue.');
    }
  };

  return (
    <div>
      <h2>Créer un nouveau sujet</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Titre:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label>Contenu:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <button type="submit">Publier</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateThreadPage;