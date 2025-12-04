import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import api from './services/api';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ThreadPage from './pages/ThreadPage';
import CreateThreadPage from './pages/CreateThreadPage';
import ProfilePage from './pages/ProfilePage';
import { ApiInterceptor } from './services/api';
import './App.css'; // On importe notre nouveau CSS

// Hook pour rafraîchir les icônes Lucide (inchangé)
function useLucideIcons() {
  const location = useLocation();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }, 10);
    return () => clearTimeout(timer);
  }, [location.pathname]);
}

// Composant pour la barre latérale (Sidebar) (inchangé)
function Sidebar() {
  const [genres, setGenres] = useState([]);

  // 1. Récupérer le Top 10 des genres au chargement du composant
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await api.get('/api/genres/top');
        setGenres(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des genres:", error);
      }
    };
    fetchGenres();
  }, []);

  // 2. Petit hack : Rafraîchir les icônes Lucide quand la liste change
  // Car les nouveaux éléments <i> sont ajoutés dynamiquement au DOM
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, [genres]);

  return (
    <aside className="sidebar">
        <h3 className="sidebar-title">Genres Populaires</h3>
        <ul className="theme-list">
            {/* Lien pour tout afficher */}
            <li>
              <Link to="/" className="theme-link">
                <i data-lucide="layout-grid"></i>
                <span>Tout</span>
              </Link>
            </li>

            {/* Génération dynamique des liens par genre */}
            {genres.map((genre) => (
              <li key={genre}>
                <Link to={`/theme/${genre}`} className="theme-link">
                  <i data-lucide="gamepad-2"></i>
                  <span>{genre}</span>
                </Link>
              </li>
            ))}
        </ul>
    </aside>
  );
}

// NOUVEAU : On crée un composant de Layout
// Il contient la sidebar et le conteneur principal
function MainLayout({ children }) {
  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

// Composant principal de l'App
function AppContent() {
  useLucideIcons();

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // --- LOGIQUE DE RECHERCHE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Effet pour la recherche avec délai (Debounce intégré ici)
  useEffect(() => {
    // Si on a moins de 3 caractères, on ne cherche pas
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timerId = setTimeout(async () => {
      try {
        // On appelle NOTRE backend sur les threads existants
        const response = await api.get(`/api/threads?search=${searchQuery}`);
        setSearchResults(response.data);
        setShowResults(true);
      } catch (error) {
        console.error("Erreur recherche:", error);
      }
    }, 300); // Délai de 300ms

    return () => clearTimeout(timerId);
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Clic sur une suggestion : On va direct au sujet
  const handleSelectResult = (threadId) => {
    setSearchQuery(''); // On vide la barre
    setShowResults(false);
    navigate(`/threads/${threadId}`);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      setShowResults(false);
      navigate(`/?search=${searchQuery}`);
    }
  };

  return (
    // ... suite du code ...
    <div className="App">
      {/* 1. Barre de Navigation du Haut (inchangée) */}
      <nav className="top-nav">
        <div className="top-nav-content">
          <div className="top-nav-left">
            <Link to="/" className="hub-logo">GameHub</Link>

            {/* --- DEBUT BARRE DE RECHERCHE --- */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Rechercher un sujet..."
                className="search-bar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                onFocus={() => { if(searchResults.length > 0) setShowResults(true); }}
                // Petit délai pour permettre le clic
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />

              {/* Liste déroulante */}
              {showResults && searchResults.length > 0 && (
                <div className="search-dropdown">
                  {searchResults.map((thread) => (
                    <div
                      key={thread.id}
                      className="search-dropdown-item"
                      onClick={() => handleSelectResult(thread.id)}
                    >
                      {/* Image miniature si disponible */}
                      {thread.game_image_url && (
                        <img src={thread.game_image_url} alt="" />
                      )}
                      <span>{thread.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* --- FIN BARRE DE RECHERCHE --- */}

          </div>
          <div className="top-nav-right">
            <Link to="/create-thread" className="btn-create-subject">
              <i data-lucide="plus"></i>
              <span>Créer un sujet</span>
            </Link>
            {token ? (
              <>
                <Link to="/profile" className="nav-link">Mon Profil</Link>
                <button onClick={handleLogout} className="logout-button">Déconnexion</button>
                <img className="avatar" src={`http://localhost:5000/uploads/default_avatar.png`} alt="Avatar" />
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Connexion</Link>
                <Link to="/register" className="nav-link">Inscription</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Contenu Principal (MODIFIÉ) */}
      {/* Le layout (sidebar + main) est maintenant géré par les routes.
        On retire les div .main-layout et .main-content d'ici.
      */}
      <Routes>
        {/* Ces routes utiliseront le MainLayout (avec sidebar) */}
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/theme/:themeName" element={<MainLayout><HomePage /></MainLayout>} />

        {/* Ces routes seront en pleine largeur (pas de sidebar) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/threads/:id" element={<ThreadPage />} />
        <Route path="/create-thread" element={<CreateThreadPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

// Wrapper global (inchangé)
function App() {
  return (
    <Router>
      <ApiInterceptor>
        <AppContent />
      </ApiInterceptor>
    </Router>
  );
}

export default App;