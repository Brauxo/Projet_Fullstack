from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import User
from extensions import db

def register():
    # Recup la db
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Valide si c'est correct
    if not username or not email or not password:
        return jsonify({'message': 'Tous les champs sont requis'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Ce nom d\'utilisateur est déjà pris'}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Cet email est déjà utilisé'}), 409

    # Hash le mdp
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    # Creation
    new_user = User(username=username, email=email, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Utilisateur créé avec succès'}), 201