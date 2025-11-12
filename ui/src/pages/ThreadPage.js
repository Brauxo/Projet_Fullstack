import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

// Importer le fichier CSS
import './ThreadPage.css';

// SUPPRIMÉ : On enlève l'import qui causait le crash
// import { ArrowLeft } from 'lucide-react';

function ThreadPage() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [message, setMessage] = useState('');

  const [currentUser, setCurrentUser] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const navigate = useNavigate();

  // --- TOUTES LES FONCTIONS DE LOGIQUE SONT CONSERVÉES (inchangées) ---

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

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get('/api/profile');
      setCurrentUser(response.data);
    } catch (error) {
      console.log("Utilisateur non connecté ou erreur de profil");
    }
  }, []);

  useEffect(() => {
    fetchThread();
    fetchCurrentUser();
  }, [fetchThread, fetchCurrentUser]);

  // UseEffect pour les icônes (corrigé)
  useEffect(() => {
    if (!loading && window.lucide) {
      window.lucide.createIcons();
    }
  }, [loading]);

  const handleReplySubmit = async (event) => {
    event.preventDefault();
    if (!replyContent) return;
    try {
      await api.post(`/api/threads/${id}/posts`, { content: replyContent });
      setReplyContent('');
      fetchThread();
    } catch (error) {
      setMessage(error.response.data.message || 'Erreur lors de la réponse.');
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      try {
        await api.delete(`/api/posts/${postId}`);
        fetchThread();
      } catch (error) {
        setMessage(error.response.data.message || 'Erreur lors de la suppression.');
      }
    }
  };

  const handleStartEditing = (post) => {
    setEditingPost(post);
    setEditingContent(post.content);
  };

  const handleCancelEditing = () => {
    setEditingPost(null);
    setEditingContent('');
  };

  const handleUpdateSubmit = async (event, postId) => {
    event.preventDefault();
    if (!editingContent) return;
    try {
      await api.put(`/api/posts/${postId}`, { content: editingContent });
      setEditingPost(null);
      setEditingContent('');
      fetchThread();
    } catch (error) {
      setMessage(error.response.data.message || "Erreur lors de la mise à jour.");
    }
  };

  const handleDeleteThread = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce sujet ? Cette action est irréversible et supprimera toutes les réponses.")) {
      try {
        await api.delete(`/api/threads/${thread.id}`);
        navigate('/');
      } catch (error) {
        setMessage(error.response?.data?.message || 'Erreur lors de la suppression du sujet.');
      }
    }
  };

  const handleToggleLike = async () => {
    if (!currentUser) {
      setMessage("Vous devez être connecté pour liker.");
      return;
    }
    try {
      const response = await api.post(`/api/threads/${id}/like`);
      setThread(prevThread => ({
        ...prevThread,
        has_liked_by_user: response.data.liked,
        like_count: response.data.like_count
      }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur lors de l'action de like.");
    }
  };

  // --- FIN DE LA LOGIQUE ---


  if (loading) {
    return <div>Chargement du sujet...</div>;
  }

  if (!thread) {
    return <div>{message || 'Sujet non trouvé.'}</div>;
  }

  const isThreadAuthor = currentUser && thread.author_id === currentUser.id;
  const originalPost = thread.posts?.[0];
  const replies = thread.posts?.slice(1) || [];

  // --- DÉBUT DU JSX ---
  return (
    <div className="thread-page-container">

      <div className="thread-header-wrapper">

        {/* Bouton "Retour" (corrigé pour utiliser la balise <i>) */}
        <Link to="/" className="back-link">
          <i data-lucide="arrow-left" style={{ width: 18, height: 18 }}></i>
          Retour à l'accueil
        </Link>

        {/* SECTION 1: L'EN-TÊTE DU JEU */}
        <div className="game-header">
          <h2>{thread.title}</h2>
          <div className="header-actions">
            <button
              onClick={handleToggleLike}
              className={`like-button ${thread.has_liked_by_user ? 'liked' : ''}`}
            >
              <span>❤️</span>
              <strong>{thread.like_count}</strong>
            </button>
            {isThreadAuthor && (
              <button
                onClick={handleDeleteThread}
                className="delete-thread-button"
              >
                Supprimer le Sujet
              </button>
            )}
          </div>
        </div>

        {/* SECTION 2: INFOS PRINCIPALES (2 colonnes) */}
        <div className="game-main-info">
          <div className="game-image-column">
            {thread.game_image_url && (
              <img src={thread.game_image_url} alt={thread.title} />
            )}
          </div>
          <div className="game-meta-column">
            <h3>Détails du jeu</h3>
            {thread.metacritic && (
              <div className="meta-item">
                <strong>Metacritic:</strong>
                <span className="metacritic-score">{thread.metacritic}</span>
              </div>
            )}
            {thread.released && (
              <div className="meta-item">
                <strong>Date de sortie:</strong>
                <span>{thread.released}</span>
              </div>
            )}
            {thread.platforms && (
              <div className="meta-item">
                <strong>Plateformes:</strong>
                <span>{thread.platforms}</span>
              </div>
            )}
            {thread.genres && (
              <div className="meta-item">
                <strong>Genres:</strong>
                <span>{thread.genres}</span>
              </div>
            )}
            {thread.website && (
              <div className="meta-item">
                <strong>Site Officiel:</strong>
                <span>
                  <a href={thread.website} target="_blank" rel="noopener noreferrer">
                    Visiter le site
                  </a>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: DESCRIPTION DU JEU */}
        {thread.game_description && (
          <div className="game-description">
            <h3>À propos du jeu</h3>
            <p>{thread.game_description}</p>
          </div>
        )}
      </div>

      <div className="thread-discussion-wrapper">
        <hr className="section-divider" />

        {/* SECTION 4: DISCUSSIONS */}
        <div className="discussion-section">
          <h3>Discussions</h3>

          {/* 4a. Le Post Original (OP) */}
          {originalPost && (() => {
            const isOriginalPostAuthor = currentUser && originalPost.author_id === currentUser.id;
            const isEditingOriginalPost = editingPost && editingPost.id === originalPost.id;

            return (
              <div className="original-post">
                <div className="author-info">
                  <img
                    src={`http://localhost:5000/uploads/${originalPost.author_avatar_url}`}
                    alt={`Avatar de ${originalPost.author_username}`}
                    className="avatar-small"
                  />
                  <strong><Link to={`/profile/${originalPost.author_id}`}>{originalPost.author_username}</Link></strong>
                  <span className="op-badge">Auteur</span>
                  <span style={{marginLeft: 'auto', color: '#a0a0a0'}}>
                    le {new Date(originalPost.created_at).toLocaleString()}
                  </span>
                </div>

                {isEditingOriginalPost ? (
                  <form className="post-edit-form" onSubmit={(e) => handleUpdateSubmit(e, originalPost.id)}>
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows="5"
                    />
                    <div>
                      <button type="submit">Enregistrer</button>
                      <button type="button" onClick={handleCancelEditing}>Annuler</button>
                    </div>
                  </form>
                ) : (
                  <div className="post-content">
                    <p>{originalPost.content}</p>
                  </div>
                )}

                {isOriginalPostAuthor && !isEditingOriginalPost && (
                  <div className="post-actions">
                    <button onClick={() => handleStartEditing(originalPost)}>Modifier</button>
                    <button onClick={() => handleDeletePost(originalPost.id)} className="delete-button">Supprimer</button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 4b. La liste des réponses */}
          <h4 className="replies-header">Réponses</h4>
          <div className="replies-list">

            {/* --- CORRECTION DE LA LOGIQUE ICI --- */}

            {replies.length > 0 ? (
              // S'il y a des réponses, on les affiche
              replies.map((post) => {
                const isPostAuthor = currentUser && post.author_id === currentUser.id;
                const isEditing = editingPost && editingPost.id === post.id;

                return (
                  <div key={post.id} className="post-reply">
                    <div className="author-info">
                      <img
                        src={`http://localhost:5000/uploads/${post.author_avatar_url}`}
                        alt={`Avatar de ${post.author_username}`}
                        className="avatar-small"
                      />
                      <strong><Link to={`/profile/${post.author_id}`}>{post.author_username}</Link></strong>
                      <span style={{marginLeft: 'auto', color: '#a0a0a0'}}>
                        le {new Date(post.created_at).toLocaleString()}
                      </span>
                    </div>

                    {isEditing ? (
                      <form className="post-edit-form" onSubmit={(e) => handleUpdateSubmit(e, post.id)}>
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows="5"
                        />
                        <div>
                          <button type="submit">Enregistrer</button>
                          <button type="button" onClick={handleCancelEditing}>Annuler</button>
                        </div>
                      </form>
                    ) : (
                      <div className="post-content">
                        <p>{post.content}</p>
                      </div>
                    )}

                    {isPostAuthor && !isEditing && (
                      <div className="post-actions">
                        <button onClick={() => handleStartEditing(post)}>Modifier</button>
                        <button onClick={() => handleDeletePost(post.id)} className="delete-button">Supprimer</button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // Sinon (s'il n'y a pas de réponses)
              <>
                {originalPost ? (
                  // Si l'OP existe, on dit "pas de réponse"
                  <p>Il n'y a pas encore de réponse. Soyez le premier !</p>
                ) : (
                  // Si même l'OP n'existe pas (sujet vide), on dit "pas de discussion"
                  <p>Il n'y a pas encore de discussion. Lancez-vous !</p>
                )}
              </>
            )}

            {/* --- FIN DE LA CORRECTION --- */}

          </div>

          {/* 4c. Le formulaire pour répondre */}
          {!editingPost && (
            <form className="reply-form" onSubmit={handleReplySubmit}>
              <h3>Participer à la discussion</h3>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Votre réponse..."
                rows="5"
              />
              <br />
              <button type="submit">Envoyer la réponse</button>
            </form>
          )}
          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default ThreadPage;