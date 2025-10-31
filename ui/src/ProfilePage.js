import React, { useState, useEffect } from 'react';
import api from './api'; // Importe notre helper API

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Le token est ajouté automatiquement !
        const response = await api.get('/api/profile');
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur chargement profil:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div>Chargement du profil...</div>;
  }

  if (!user) {
    return <div>Impossible de charger le profil.</div>;
  }

  return (
    <div>
      <h2>Mon Profil</h2>
      <p><strong>Nom d'utilisateur:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
}

export default ProfilePage;