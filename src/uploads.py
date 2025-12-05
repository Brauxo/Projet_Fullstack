from flask import send_from_directory
import os

UPLOAD_DIRECTORY = os.path.join(os.getcwd(), 'uploads')

def serve_upload(filename):
    # send_from_directory va chercher le fichier dans le dossier spécifié et le renvoyer au navigateur avec le bon type de contenu 
    # C'est une méthode sécurisée qui empêche d'accéder à des fichiers !!
    try:
        return send_from_directory(UPLOAD_DIRECTORY, filename)
    except FileNotFoundError:
        # Faire en sorte d'avoir un avatar par défaut si le fichier n'existe pas (good normalement)
        return send_from_directory(UPLOAD_DIRECTORY, 'default_avatar.png')