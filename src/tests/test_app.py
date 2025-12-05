import pytest
import sys
import os
from unittest.mock import patch

# path src (a check)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app
from extensions import db
from models import User, Thread, Post

@pytest.fixture(scope='module')
def test_client():
    # config en test
    app.config['TESTING'] = True
    # SQLite pour être opti
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    app.config['RAWG_API_KEY'] = 'test-rawg-key'
    
    with app.app_context():
        db.create_all()
        yield app.test_client()  # test
        # remove tout
        db.session.remove()
        db.drop_all()

@pytest.fixture(scope='function')
def auth_header(test_client):
    """Test pour créer un utilisateur, le connecter et récupérer le token"""
    # 1. Inscription
    user_data = {
        "username": "TestUser",
        "email": "test@example.com",
        "password": "password123"
    }
    test_client.post('/api/register', json=user_data)
    
    # 2. Login
    login_resp = test_client.post('/api/login', json={
        "email": "test@example.com",
        "password": "password123"
    })
    
    token = login_resp.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}


def test_health_check(test_client):
    """Vérifie que l'API répond"""
    response = test_client.get('/api/hello')
    assert response.status_code == 200
    assert response.get_json()['message'] == "Hello from Flask!"

def test_register_login(test_client):
    """Teste le flux d'inscription et de connexion"""
    # Inscription
    payload = {
        "username": "NewUser",
        "email": "new@example.com",
        "password": "securepass"
    }
    response = test_client.post('/api/register', json=payload)
    assert response.status_code == 201
    
    # Doublon
    response_dupe = test_client.post('/api/register', json=payload)
    assert response_dupe.status_code == 409  

    # Login
    login_payload = {
        "email": "new@example.com",
        "password": "securepass"
    }
    response_login = test_client.post('/api/login', json=login_payload)
    assert response_login.status_code == 200
    assert 'access_token' in response_login.get_json()

def test_profile_access(test_client, auth_header):
    """Teste l'accès à une route protégée"""
    # Sans token
    response_fail = test_client.get('/api/profile')
    assert response_fail.status_code == 401
    
    # Avec token
    response_ok = test_client.get('/api/profile', headers=auth_header)
    assert response_ok.status_code == 200
    data = response_ok.get_json()
    assert data['username'] == "TestUser"

@patch('threads.requests.get')
def test_create_thread(mock_get, test_client, auth_header):
    """Teste la création d'un thread avec un mock de l'api"""
    
    # configuration du mock
    mock_response = mock_get.return_value
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "id": 12345,
        "name": "Cyberpunk 2077",
        "background_image": "http://img.com/fake.jpg",
        "description_raw": "Best game ever",
        "metacritic": 99,
        "released": "2025-01-01",
        "website": "http://game.com",
        "genres": [{"name": "RPG"}],
        "platforms": [{"platform": {"name": "PC"}}]
    }
    
    payload = {
        "rawg_game_id": 12345,
        "content": "Mon premier avis sur ce jeu !"
    }
    
    response = test_client.post('/api/threads', json=payload, headers=auth_header)
    
    assert response.status_code == 201 # Created
    data = response.get_json()
    assert "Sujet créé avec succès" in data['message']
    
    # Vérification en base (via l'API)
    thread_id = data['id']
    resp_detail = test_client.get(f'/api/threads/{thread_id}')
    assert resp_detail.get_json()['title'] == "Cyberpunk 2077"

def test_post_comment(test_client, auth_header):
    """Teste l'ajout d'un commentaire sur un thread existant"""
    # On dépend de l'état créé par test_create_thread ou on recrée un contexte
    # Pour simplifier ici, on suppose que le thread ID 1 existe grâce au test précédent 
    with app.app_context():
        u = User.query.filter_by(username="TestUser").first()
        t = Thread(title="Test Game", author=u, user_id=u.id, rawg_game_id=999)
        db.session.add(t)
        db.session.commit()
        thread_id = t.id

    payload = {"content": "yo"}
    response = test_client.post(f'/api/threads/{thread_id}/posts', json=payload, headers=auth_header)
    
    assert response.status_code == 201
    
    # check le commentaire
    response_get = test_client.get(f'/api/threads/{thread_id}')
    posts = response_get.get_json()['posts']
    assert len(posts) > 0
    assert posts[-1]['content'] == "yo"