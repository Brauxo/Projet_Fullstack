from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from models import Thread, User
from extensions import db

def create_thread():
    data = request.get_json()
    title = data.get('title')
    # Todo : On créera un objet Post pour ça plus tard. Pour l'instant, on se concentre sur le titre, on cosindère premier message = contenu

    if not title:
        return jsonify({"message": "Le titre est requis"}), 400

    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
         return jsonify({"message": "Utilisateur non trouvé"}), 404

    new_thread = Thread(title=title, author=user)
    db.session.add(new_thread)
    db.session.commit()

    return jsonify({"message": "Sujet créé avec succès", "id": new_thread.id}), 201


def get_all_threads():
    threads = Thread.query.order_by(Thread.created_at.desc()).all()
    
    # On prépare les données pour les renvoyer en JSON
    threads_data = []
    for thread in threads:
        threads_data.append({
            "id": thread.id,
            "title": thread.title,
            "author_username": thread.author.username, # Merci db.relationship :)
            "created_at": thread.created_at.isoformat()
        })

    return jsonify(threads_data)

def get_all_threads():
    threads = Thread.query.order_by(Thread.created_at.desc()).all()
    
    # renvoie
    threads_data = []
    for thread in threads:
        threads_data.append({
            "id": thread.id,
            "title": thread.title,
            "author_username": thread.author.username, 
            "created_at": thread.created_at.isoformat()
        })

    return jsonify(threads_data)