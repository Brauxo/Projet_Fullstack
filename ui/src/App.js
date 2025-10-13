import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/hello')
      .then(response => response.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bienvenue sur notre Forum !</h1>
        <p>Message du backend : <strong>{message || "Chargement..."}</strong></p>
      </header>
    </div>
  );
}

export default App;