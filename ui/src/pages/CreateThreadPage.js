import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

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

    try {
      // NOUVEL APPEL API pour vérifier si le sujet existe
      const response = await api.get(`/api/threads/check_game/${game.id}`);
      if (response.data.exists) {
        setExistingThreadId(response.data.thread_id);
        setMessage("Ce jeu a déjà un sujet de discussion. Votre message sera ajouté à la discussion existante.");
      } else {
        setExistingThreadId(null);
        setMessage("Vous êtes le premier à lancer une discussion sur ce jeu !");
      }
    } catch (error) {
      console.error("Erreur vérification sujet:", error);
      setMessage("Impossible de vérifier si un sujet existe.");
    }
  };

  // MODIFIÉ : Réinitialise les nouveaux états
  const handleClearSelection = () => {
    setSelectedGame(null);
    setSearchQuery('');
    setExistingThreadId(null); // Réinitialiser
    setMessage(''); // Réinitialiser
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedGame || !content) {
      setMessage('Veuillez sélectionner un jeu et écrire un premier message.');
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
    }
  };

  return (
    <div>
      <h2>Lancer une nouvelle discussion</h2>
      <form onSubmit={handleSubmit}>

        {/* --- Section 1: Sélection du jeu --- */}
        <div>
          <label>1. Choisissez un jeu :</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Commencez à taper un nom de jeu..."
            disabled={!!selectedGame}
            style={{width: '100%', marginBottom: '5px'}}
          />

          {selectedGame && (
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px', background: '#2c313a', padding: '10px', borderRadius: '8px'}}>
              <img src={selectedGame.background_image} alt={selectedGame.name} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px'}} />
              <span style={{flexGrow: 1}}>{selectedGame.name}</span>
              <button type="button" onClick={handleClearSelection} style={{background: '#dc3545', color: 'white'}}>Changer</button>
            </div>
          )}

          {isSearching && !selectedGame && <p>Recherche...</p>}

          {searchResults.length > 0 && !selectedGame && (
            <ul style={{listStyle: 'none', padding: 0, margin: 0, border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden'}}>
              {searchResults.map((game) => (
                <li
                  key={game.id}
                  onClick={() => handleSelectGame(game)}
                  style={{padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'}}
                  className="search-result-item" // Ajoutez une classe pour le hover CSS si vous voulez
                >
                  <img src={game.background_image} alt="" style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px'}} />
                  {game.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- Section 2: Contenu du post --- */}
        {selectedGame && (
          <div style={{marginTop: '20px'}}>
            <label>2. Votre premier message :</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="8"
              placeholder="Partagez un avis, une question, une astuce..."
              style={{width: '100%'}}
            />
          </div>
        )}

        {/* MODIFIÉ : Texte du bouton dynamique */}
        <button type="submit" disabled={!selectedGame || !content} style={{marginTop: '20px'}}>
          {existingThreadId ? "Ajouter à la discussion" : "Lancer la discussion"}
        </button>
      </form>
      {/* Le message de statut s'affiche ici */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateThreadPage;