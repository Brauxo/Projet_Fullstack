from flask import jsonify , request, url_for
from flask_jwt_extended import get_jwt_identity, jwt_required
from models import User
import os
from werkzeug.utils import secure_filename
from extensions import db

UPLOAD_FOLDER = 'uploads'

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}

def get_user_profile():
    # Permet de récupérer l'ID de l'utilisateur stocké dans le token
    current_user_id = get_jwt_identity()

    # avec l'id on recup dans la db
    user = User.query.get(current_user_id)

    # verifie si l'utilisateur existe
    if not user:
        return jsonify({"message": "Utilisateur non trouvé"}), 404
    
    avatar_filename = user.avatar_url or 'default_avatar.png'
    avatar_full_url = url_for('get_upload', filename=avatar_filename, _external=True)

    # renvoie sans le password
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat(), # date de creation format ISO
        "avatar_url": avatar_filename 
    }

    return jsonify(user_data)


@jwt_required()
def upload_avatar():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    if 'avatar' not in request.files:
        return jsonify({"message": "Aucun fichier sélectionné"}), 400
    
    file = request.files['avatar']
    if file.filename == '':
        return jsonify({"message": "Aucun fichier sélectionné"}), 400

    if file and allowed_file(file.filename):
        # Renomme le fichier par sécurité
        filename = secure_filename(file.filename)
        unique_filename = f"user_{user.id}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(filepath)
        user.avatar_url = unique_filename 
        db.session.commit()

        return jsonify({"message": "Avatar mis à jour avec succès", "avatar_url": unique_filename})
    else:
        return jsonify({"message": "Type de fichier non autorisé"}), 400
    

def get_public_user_profile(user_id):
    user = User.query.get_or_404(user_id)

    avatar_filename = user.avatar_url or 'default_avatar.png'
    public_data = {
        "id": user.id,
        "username": user.username,
        "created_at": user.created_at.isoformat(),
        "avatar_url": avatar_filename 
    }

    return jsonify(public_data)