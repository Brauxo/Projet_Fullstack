import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link, useParams } from 'react-router-dom';

function HomePage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { themeName } = useParams(); // Récupère le thème depuis l'URL (si présent)

  // Titre dynamique basé sur le thème
  const title = themeName ? `Flux: ${themeName.charAt(0).toUpperCase() + themeName.slice(1)}` : "Sujets récents";

  useEffect(() => {
    const fetchThreads = async () => {
      setLoading(true);
      try {
        // On prépare l'URL de base
        let url = '/api/threads';

        // Si un thème est sélectionné, on l'ajoute comme paramètre de filtre
        if (themeName) {
          // encodeURIComponent gère les espaces et caractères spéciaux (ex: "Action-Adventure")
          url += `?genre=${encodeURIComponent(themeName)}`;
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
  }, [themeName]);


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

              {/* MODIFIÉ: Utilisation de la vraie image du jeu */}
              <div className="game-card-image">
                <img
                  src={thread.game_image_url || `https://placehold.co/600x338/94a3b8/1a1d21?text=${thread.title.charAt(0)}`}
                  alt={`Sujet: ${thread.title}`}
                />
              </div>

              {/* Contenu de la carte */}
              <div className="game-card-content">
                <span className="game-card-title">{thread.title}</span>
                <div className="game-card-meta">
                  {/* J'adapte la méta pour afficher l'auteur, ce que ton API fournit */}
                  <span>
                    <img
                      src={`http://localhost:5000/uploads/${thread.author_avatar_url}`}
                      alt={thread.author_username}
                      style={{width: '16px', height: '16px', borderRadius: '50%'}}
                    />
                    {thread.author_username}
                  </span>
                  {/* TODO: Ajouter le nombre de réponses/vues quand l'API le fournira */}
                  {/* <span><i data-lucide="message-circle"></i> 0</span> */}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p>Aucun sujet pour le moment.</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;