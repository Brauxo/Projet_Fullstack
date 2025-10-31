import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from './api';

function ThreadPage() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [message, setMessage] = useState('');

  const fetchThread = useCallback(async () => {
    try {
      const response = await api.get(`/api/threads/${id}`);
      setThread(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur chargement thread:", error);
      setLoading(false);
      setMessage("Impossible de charger ce sujet.");
    }
  }, [id]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  const handleReplySubmit = async (event) => {
    event.preventDefault();
    if (!replyContent) return;

    try {
      await api.post(`/api/threads/${id}/posts`, {
        content: replyContent
      });

      setReplyContent('');
      fetchThread();
    } catch (error) {
      setMessage(error.response.data.message || 'Erreur lors de la réponse.');
    }
  };

  if (loading) {
    return <div>Chargement du sujet...</div>;
  }

  if (!thread) {
    return <div>{message || 'Sujet non trouvé.'}</div>;
  }

  return (
    <div>
      {/* 1. Le sujet original */}
      <h2>{thread.title}</h2>
      <p>par {thread.author_username}</p>
      <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
        <p>{thread.content}</p>
      </div>

      <hr />

      {/* 2. Les réponses (posts) */}
      <h3>Réponses</h3>
      {thread.posts && thread.posts.length > 0 ? (
        thread.posts.map((post) => (
          <div key={post.id} style={{ borderBottom: '1px solid #eee', padding: '10px' }}>
            <p><strong>{post.author_username}</strong> a écrit :</p>
            <p>{post.content}</p>
            <small>le {new Date(post.created_at).toLocaleString()}</small>
          </div>
        ))
      ) : (
        <p>Il n'y a pas encore de réponse.</p>
      )}

      <hr />

      {/* 3. Le formulaire pour répondre */}
      <form onSubmit={handleReplySubmit}>
        <h3>Répondre</h3>
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Votre réponse..."
          rows="5"
          style={{ width: '80%' }}
        />
        <br />
        <button type="submit">Envoyer la réponse</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ThreadPage;