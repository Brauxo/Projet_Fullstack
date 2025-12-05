import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './CreateThreadPage.css';

// Hook simple pour "déclencher" une action après un délai
// On l'utilise pour ne pas appeler l'API à chaque frappe
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

function CreateThreadPage() {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // États pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  // NOUVEL ÉTAT pour savoir si le sujet existe
  const [existingThreadId, setExistingThreadId] = useState(null);

  const [isError, setIsError] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms de délai

  // Fonction pour rechercher les jeux
  const searchRawgGames = useCallback(async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const response = await api.get(`/api/games/search?q=${query}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Erreur recherche de jeu:", error);
      setMessage("Erreur lors de la recherche du jeu.");
      setIsError(true);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Effect pour lancer la recherche "débattue"
  useEffect(() => {
    if (debouncedSearchQuery && !selectedGame) {
      searchRawgGames(debouncedSearchQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery, searchRawgGames, selectedGame]);


  // MODIFIÉ : Gère la sélection ET la vérification
  const handleSelectGame = async (game) => {
    setSelectedGame(game);
    setSearchQuery(game.name); // Remplit le champ de recherche avec le nom
    setSearchResults([]); // Cache les résultats
    setMessage("Vérification de l'existence d'un sujet..."); // Message temporaire
    setIsError(false);

    try {
      // NOUVEL APPEL API pour vérifier si le sujet existe
      const response = await api.get(`/api/threads/check_game/${game.id}`);
      if (response.data.exists) {
        setExistingThreadId(response.data.thread_id);
        setMessage("Ce jeu a déjà un sujet de discussion. Votre message sera ajouté à la discussion existante.");
        setIsError(false);
      } else {
        setExistingThreadId(null);
        setMessage("Vous êtes le premier à lancer une discussion sur ce jeu !");
        setIsError(false);
      }
    } catch (error) {
      console.error("Erreur vérification sujet:", error);
      setMessage("Impossible de vérifier si un sujet existe.");
      setIsError(true);
    }
  };

  // MODIFIÉ : Réinitialise les nouveaux états
  const handleClearSelection = () => {
    setSelectedGame(null);
    setSearchQuery('');
    setExistingThreadId(null); // Réinitialiser
    setMessage(''); // Réinitialiser
    setIsError(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedGame || !content) {
      setMessage('Veuillez sélectionner un jeu et écrire un premier message.');
      setIsError(true);
      return;
    }

    try {
      // L'API backend s'occupe de "créer OU trouver" le sujet
      const response = await api.post('/api/threads', {
        rawg_game_id: selectedGame.id,
        content: content
      });

      // Naviguer vers le sujet (qu'il soit nouveau ou existant)
      navigate(`/threads/${response.data.id}`);

    } catch (error) {
      setMessage(error.response?.data?.message || 'Une erreur est survenue.');
      setIsError(true);
    }
  };

return (
    <div className="form-container">
      <div className="form-card">
        <h2>Lancer une nouvelle discussion</h2>
        <form onSubmit={handleSubmit}>

          {/* --- Section 1: Sélection du jeu --- */}
          <div className="form-group">
            <label className="form-label">1. Choisissez un jeu :</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Commencez à taper un nom de jeu..."
              disabled={!!selectedGame}
              className="form-input"
            />
          </div>

          {selectedGame && (
            <div className="selected-game-card">
              <img 
                src={selectedGame.background_image} 
                alt={selectedGame.name} 
                className="selected-game-image"
              />
              <span className="selected-game-info">{selectedGame.name}</span>
              <button 
                type="button" 
                onClick={handleClearSelection} 
                className="form-button button-danger"
              >
                Changer
              </button>
            </div>
          )}

          {isSearching && !selectedGame && <p className="form-message info">Recherche...</p>}

          {searchResults.length > 0 && !selectedGame && (
            <ul className="search-results-list">
              {searchResults.map((game) => (
                <li
                  key={game.id}
                  onClick={() => handleSelectGame(game)}
                  className="search-result-item"
                >
                  <img 
                    src={game.background_image} 
                    alt="" 
                    className="search-result-image" 
                  />
                  {game.name}
                </li>
              ))}
            </ul>
          )}

          {/* --- Section 2: Contenu du post --- */}
          {selectedGame && (
            <div className="form-group">
              <label className="form-label">2. Votre premier message :</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="8"
                placeholder="Partagez un avis, une question, une astuce..."
                className="form-input"
              />
            </div>
          )}

          {/* Bouton dynamique */}
          <button type="submit" disabled={!selectedGame || !content} className="form-button">
            {existingThreadId ? "Ajouter à la discussion" : "Lancer la discussion"}
          </button>
        </form>
        
        {/* Message de statut (style géré par isError) */}
        {message && (
          <p className={`form-message ${isError ? '' : 'success'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default CreateThreadPage;