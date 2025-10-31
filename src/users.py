from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from models import User

def get_user_profile():
    # Permet de récupérer l'ID de l'utilisateur stocké dans le token
    current_user_id = get_jwt_identity()

    # avec l'id on recup dans la db
    user = User.query.get(current_user_id)

    # verifie si l'utilisateur existe
    if not user:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    # renvoie sans le password
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat() # date de creation format ISO
    }

    return jsonify(user_data)