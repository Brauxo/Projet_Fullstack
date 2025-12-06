import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link, useParams, useSearchParams } from 'react-router-dom';

function HomePage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupération des paramètres (URL)
  const { themeName } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');

  // Titre dynamique
  let title = "Sujets récents";
  if (themeName) {
    title = `Flux: ${themeName.charAt(0).toUpperCase() + themeName.slice(1)}`;
  }
  if (searchQuery) {
    title = `Résultats pour : "${searchQuery}"`;
  }

  // Chargement des données
  useEffect(() => {
    const fetchThreads = async () => {
      setLoading(true);
      try {
        let url = '/api/threads';
        const params = new URLSearchParams();

        if (themeName) {
          params.append('genre', themeName);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        //ajout parametre url
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await api.get(url);

        if (Array.isArray(response.data)) {
          setThreads(response.data);
        } else if (response.data && Array.isArray(response.data.threads)) {
          setThreads(response.data.threads);
        }
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des threads:", error);
        setLoading(false);
      }
    };

    fetchThreads();
  }, [themeName, searchQuery]);

  if (loading) {
    return <h1 className="flux-title">Chargement...</h1>;
  }

  return (
    <div>
      <h1 className="flux-title mb-6">{title}</h1>

      <div className="game-grid">
        {Array.isArray(threads) && threads.length > 0 ? (
          threads.map((thread) => (
            <Link to={`/threads/${thread.id}`} key={thread.id} className="game-card">

              <div className="game-card-image">
                <img
                  src={thread.game_image_url || `https://placehold.co/600x338/94a3b8/1a1d21?text=${thread.title.charAt(0)}`}
                  alt={`Sujet: ${thread.title}`}
                />
              </div>

              <div className="game-card-content">
                <span className="game-card-title">{thread.title}</span>
                <div className="game-card-meta">
                  <span>
                    <img
                      src={`http://localhost:5000/uploads/${thread.author_avatar_url}`}
                      alt={thread.author_username}
                      style={{width: '16px', height: '16px', borderRadius: '50%'}}
                    />
                    {thread.author_username}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p>Aucun sujet ne correspond à votre recherche.</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;