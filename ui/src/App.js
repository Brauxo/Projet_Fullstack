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
  return (
    <aside className="sidebar">
        <h3 className="sidebar-title">Thèmes</h3>
        <ul className="theme-list">
            <li><Link to="/theme/fortnite" className="theme-link active"><i data-lucide="flame"></i><span>Fortnite</span></Link></li>
            <li><Link to="/theme/valorant" className="theme-link"><i data-lucide="sword"></i><span>Valorant</span></Link></li>
            <li><Link to="/theme/lol" className="theme-link"><i data-lucide="shield"></i><span>League of Legends</span></Link></li>
            <li><Link to="/theme/general" className="theme-link"><i data-lucide="message-square"></i><span>Général</span></Link></li>
            <li><Link to="/theme/lfg" className="theme-link"><i data-lucide="users"></i><span>Recherche d'Équipe</span></Link></li>
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
  useLucideIcons(); // Active le hook pour les icônes

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const token = localStorage.getItem('token');

  return (
    <div className="App">
      {/* 1. Barre de Navigation du Haut (inchangée) */}
      <nav className="top-nav">
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