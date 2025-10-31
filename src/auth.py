from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import User
from extensions import db
from flask_jwt_extended import create_access_token

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


def login():
    # Recup la db
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # trouve l'utilisateur
    user = User.query.filter_by(email=email).first()

    # check que l'utilisateur existe et que le mdp est bon
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Identifiants invalides'}), 401
    
    # créer le token (en str !!!)
    access_token = create_access_token(identity=str(user.id))

    # renvoie le token
    return jsonify(access_token=access_token)