import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function HomePage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');


  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await axios.get('/api/threads');

        if (Array.isArray(response.data)) {
          setThreads(response.data);
        }

        else if (response.data && Array.isArray(response.data.threads)) {
          setThreads(response.data.threads);
        }

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des threads:", error);
        setLoading(false);
      }
    };

    fetchThreads();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      {/* --- SECTION AJOUTÉE --- */}
      <h2>Bienvenue sur le forum !</h2>
      {/* J'utilise les nouvelles classes CSS pour la nav et les listes */}
      <nav className="welcome-nav" style={{ marginBottom: '20px', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9', maxWidth: '500px', margin: '20px auto' }}>
        <p style={{ marginTop: 0, fontWeight: 'bold' }}>Que souhaitez-vous faire ?</p>
        {token ? (
          // Si l'utilisateur est connecté
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ margin: '10px 0' }}><Link to="/create-thread">Créer un nouveau sujet</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/profile">Voir mon profil</Link></li>
            {/* Le bouton déconnexion est déjà dans App.js, pas besoin de le dupliquer ici */}
          </ul>
        ) : (
          // Si l'utilisateur n'est pas connecté
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ margin: '10px 0' }}><Link to="/login">Se connecter</Link></li>
            <li style={{ margin: '10px 0' }}><Link to="/register">S'inscrire</Link></li>
          </ul>
        )}
      </nav>
      {/* --- FIN SECTION AJOUTÉE --- */}

      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '30px 0' }} />

      <h2>Sujets de discussion</h2>

      {/* On ajoute une vérification de sécurité ici :
        On s'assure que 'threads' est bien un tableau avant de faire .length
      */}
      {Array.isArray(threads) && threads.length > 0 ? (
        // J'ajoute la className pour que le CSS s'applique
        <ul className="thread-list">
          {threads.map((thread) => (
            // J'ajoute la className pour que le CSS s'applique
            <li key={thread.id} className="thread-item">
              <Link to={`/threads/${thread.id}`}>
                {thread.title}
              </Link>
              {/* On ajoute une sécurité si 'author_username' n'existe pas */}
              <p>par {thread.author_username || 'Anonyme'}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun sujet pour le moment.</p>
      )}
    </div>
  );
}

export default HomePage;
