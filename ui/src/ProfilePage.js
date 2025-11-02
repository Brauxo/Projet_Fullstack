import React, { useState, useEffect, useCallback } from 'react';
import api from './api'; // Importe notre helper API

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/api/profile');
      setUser(response.data);
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); 

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleAvatarUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setMessage("Veuillez sélectionner un fichier.");
      return;
    }

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      await api.post('/api/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage("Avatar mis à jour avec succès !");
      fetchProfile(); 
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur lors de l'envoi.");
    }
  };
  if (loading) {
    return <div>Chargement du profil...</div>;
  }

  if (!user) {
    return <div>Impossible de charger le profil.</div>;
  }

  return (
    <div>
      <h2>Mon Profil</h2>
      {user.avatar_url && (
        <img 
          src={`http://localhost:5000/uploads/${user.avatar_url}`} 
          alt="Avatar de l'utilisateur" 
          style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '20px' }}
        />
      )}

      <p><strong>Nom d'utilisateur:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <hr style={{ margin: '30px 0' }} />
      <h3>Changer ma photo de profil</h3>
      <form onSubmit={handleAvatarUpload}>
        <div>
          <label>Nouveau Fichier:</label>
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept="image/png, image/jpeg, image/gif"
          />
        </div>
        <button type="submit">Mettre à jour</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ProfilePage;