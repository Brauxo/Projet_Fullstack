import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ThreadPage from './pages/ThreadPage';
import CreateThreadPage from './pages/CreateThreadPage';
import ProfilePage from './pages/ProfilePage';
import { ApiInterceptor } from './services/api';
import './App.css'; // On importe notre nouveau CSS

// Hook pour rafraîchir les icônes Lucide à chaque changement de page
function useLucideIcons() {
  const location = useLocation();
  useEffect(() => {
    // On met un léger délai pour laisser React mettre à jour le DOM
    const timer = setTimeout(() => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }, 10); // 10ms
    return () => clearTimeout(timer);
  }, [location.pathname]); // Se redéclenche à chaque changement de route
}

// Composant pour la barre latérale (Sidebar)
function Sidebar() {
  // Plus tard, on pourra rendre le "active" dynamique
  return (
    <aside className="sidebar">
        <h3 className="sidebar-title">Thèmes</h3>
        {/* MODIFIÉ : Ajout de la classe "theme-list" */}
        <ul className="theme-list">
            {/* On utilise des Link pour la navigation React */}
            <li><Link to="/theme/fortnite" className="theme-link active"><i data-lucide="flame"></i><span>Fortnite</span></Link></li>
            <li><Link to="/theme/valorant" className="theme-link"><i data-lucide="sword"></i><span>Valorant</span></Link></li>
            <li><Link to="/theme/lol" className="theme-link"><i data-lucide="shield"></i><span>League of Legends</span></Link></li>
            <li><Link to="/theme/general" className="theme-link"><i data-lucide="message-square"></i><span>Général</span></Link></li>
            <li><Link to="/theme/lfg" className="theme-link"><i data-lucide="users"></i><span>Recherche d'Équipe</span></Link></li>
        </ul>
    </aside>
  );
}

// Composant principal de l'App
function AppContent() {
  useLucideIcons(); // Active le hook pour les icônes

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'; // Gardons le rechargement pour l'instant
  };

  const token = localStorage.getItem('token');

  return (
    <div className="App">
      {/* 1. Barre de Navigation du Haut */}
      <nav className="top-nav">
        {/* MODIFIÉ : Ajout d'un conteneur pour centrer le contenu */}
        <div className="top-nav-content">
          <div className="top-nav-left">
            <Link to="/" className="hub-logo">GameHub</Link>
            <input type="text" placeholder="Rechercher dans le Hub..." className="search-bar" />
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

      {/* 2. Contenu Principal (Layout Sidebar + Flux) */}
      <div className="main-layout">

        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* On ajoute des routes pour les thèmes (même si elles pointent vers HomePage) */}
            <Route path="/theme/:themeName" element={<HomePage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/threads/:id" element={<ThreadPage />} />
            <Route path="/create-thread" element={<CreateThreadPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Wrapper global (pour le Router et l'Interceptor)
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