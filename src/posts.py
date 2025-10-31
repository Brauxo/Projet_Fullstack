from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from models import Post, User, Thread
from extensions import db

def create_post_in_thread(thread_id):
    # On vérifie d'abord que le sujet existe
    thread = Thread.query.get(thread_id)
    if not thread:
        return jsonify({"message": "Sujet non trouvé"}), 404

    data = request.get_json()
    content = data.get('content')

    if not content:
        return jsonify({"message": "Un contenu est requis"}), 400

    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    new_post = Post(content=content, author=user, thread=thread)
    db.session.add(new_post)
    db.session.commit()

    return jsonify({"message": "Réponse ajoutée avec succès", "id": new_post.id}), 201