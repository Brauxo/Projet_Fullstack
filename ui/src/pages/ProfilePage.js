import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import './ProfilePage.css'; 

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false); 
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // La logique de fetchProfile est correcte
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

  // Logique d'upload d'avatar (mise à jour pour les messages)
  const handleAvatarUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setMessage("Veuillez sélectionner un fichier.");
      setIsError(true);
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
      setIsError(false);
      fetchProfile(); // Rafraîchit les données (et donc l'avatar)
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur lors de l'envoi.");
      setIsError(true);
    }
  };

  // Logique de suppression de compte (mise à jour pour les messages)
  const handleDeleteAccount = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est définitive et irréversible.")) {
      return;
    }
    try {
      await api.delete('/api/users/me');
      localStorage.removeItem('token');
      setMessage("Compte supprimé avec succès. Redirection...");
      setIsError(false);
      setTimeout(() => {
        window.location.href = '/login'; 
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur lors de la suppression du compte.");
      setIsError(true);
    }
  };
  
  if (loading) {
    return <div className="form-container">Chargement du profil...</div>;
  }

  if (!profileData) { 
    return <div className="form-container">Impossible de charger le profil.</div>;
  }

  const avatarUrl = `http://localhost:5000/uploads/${profileData.avatar_url}`;

  return (
    <div className="profile-page-container form-container">
      <div className="profile-card form-card">

        <div className="profile-header">
          <img 
            src={avatarUrl} 
            alt={`Avatar de ${profileData.username}`}
            className="profile-avatar"
          />
          <div className="profile-info">
            <h2 className="profile-username">{profileData.username}</h2>
            {isOwnProfile && (
              <p className="profile-email">{profileData.email}</p>
            )}
          </div>
        </div>

        {isOwnProfile && (
          <>
            <hr />
            <h3>Changer ma photo de profil</h3>
            <form onSubmit={handleAvatarUpload} className="avatar-form">
              <div className="form-group" style={{ flexGrow: 1, marginBottom: 0 }}>
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/gif"
                    className="form-input"
                />
              </div>
              <button type="submit" className="form-button">Mettre à jour</button>
            </form>
            
            {/* Message de succès ou d'erreur */}
            {message && <p className={`form-message ${isError ? '' : 'success'}`}>{message}</p>}

            <hr />
            <div className="danger-zone">
              <h3>Zone de danger</h3>
              <p style={{marginTop: 0, color: '#721c24'}}>Cette action est irréversible.</p>
              <button
                  onClick={handleDeleteAccount}
                  className="delete-button"
              >
                Supprimer mon compte
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;