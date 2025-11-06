import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ThreadPage from './pages/ThreadPage';
import CreateThreadPage from './pages/CreateThreadPage';
import ProfilePage from './pages/ProfilePage';
import { ApiInterceptor } from './services/api';
import './App.css';

function App() {
  //Deconexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const token = localStorage.getItem('token');

  return (
    <Router>
      {/* L'intercepteur va s'activer ici */}
      <ApiInterceptor>
        <div className="App">
          <nav>
            <ul>
              <li><Link to="/">Accueil</Link></li>

              {/* Change les liens si on est connecté ou non */}
              {token ? (
                <>
                  <li><Link to="/create-thread">Nouveau Sujet</Link></li>
                  <li><Link to="/profile">Mon Profil</Link></li>
                  <li><button onClick={handleLogout}>Déconnexion</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/login">Connexion</Link></li>
                  <li><Link to="/register">Inscription</Link></li>
                </>
              )}
            </ul>
          </nav>

          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/threads/:id" element={<ThreadPage />} />
              <Route path="/create-thread" element={<CreateThreadPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
            </Routes>
          </main>
        </div>
      </ApiInterceptor>
    </Router>
  );
}

export default App;