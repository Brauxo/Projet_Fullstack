import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
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

console.log("Données du thread reçues par React:", thread);  /* A delete plus tard */

return (
    <div>
      {/* 1. Le sujet original */}
      <h2>{thread.title}</h2>
      <div className="author-info" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <img 
          src={`http://localhost:5000/uploads/${thread.author_avatar_url}`} 
          alt={`Avatar de ${thread.author_username}`}
          style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }}
        />
        <p style={{ margin: 0, fontSize: '1.1rem' }}>
          par <Link to={`/profile/${thread.author_id}`}>{thread.author_username}</Link>
        </p>
      </div>

      <div className="thread-original-post">
        {thread.posts && thread.posts.length > 0 ? (
            <p>{thread.posts[0].content}</p>
        ) : (
            <p>Ce sujet n'a pas encore de contenu.</p>
        )}
      </div>

      <hr />
      {/* 2. Les réponses (posts) */}
      <h3>Réponses</h3>
      {thread.posts && thread.posts.length > 1 ? (
      /* Pour Elliot : Faut commencer à 1 sinon ca affiche le sujet donc ca créer un doublon */
        thread.posts.slice(1).map((post) => (
          <div key={post.id} className="post-reply">
            <div className="author-info" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img 
                src={`http://localhost:5000/uploads/${post.author_avatar_url}`} 
                alt={`Avatar de ${post.author_username}`}
                style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '8px', objectFit: 'cover' }}
              />
              <p style={{ margin: 0 }}>
                <strong><Link to={`/profile/${post.author_id}`}>{post.author_username}</Link></strong> a écrit :
              </p>
            </div>

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
        />
        <br />
        <button type="submit">Envoyer la réponse</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ThreadPage;