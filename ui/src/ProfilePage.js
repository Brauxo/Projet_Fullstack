import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from './api'; // Importe notre helper API

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (id) {
        response = await api.get(`/api/users/${id}`);
        setIsOwnProfile(false); 
      } else {
        response = await api.get('/api/profile');
        setIsOwnProfile(true); 
      }
      setProfileData(response.data);
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    } finally {
      setLoading(false);
    }
  }, [id]); 

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

  if (!profileData) { 
    return <div>Impossible de charger le profil.</div>;
  }

  const avatarUrl = `http://localhost:5000/uploads/${profileData.avatar_url}`;

  return (
    <div>
      <h2>Profil de {profileData.username}</h2>
      <img 
        src={avatarUrl} 
        alt={`Avatar de ${profileData.username}`}
        style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '20px' }}
      />

      <p><strong>Nom d'utilisateur:</strong> {profileData.username}</p>
      
      {/* AFFICHE L'EMAIL si c'est notre profil) */}
      {isOwnProfile && (
        <p><strong>Email:</strong> {profileData.email}</p>
      )}
      {isOwnProfile && (
        <>
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
            <button type="submit" style={{ marginTop: '10px' }}>Mettre à jour</button>
          </form>
          {message && <p>{message}</p>}
        </>
      )}
    </div>
  );
}

export default ProfilePage;