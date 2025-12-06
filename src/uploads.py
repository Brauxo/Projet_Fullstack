from flask import send_from_directory
import os

UPLOAD_DIRECTORY = os.path.join(os.getcwd(), 'uploads')

def serve_upload(filename):
    try:
        return send_from_directory(UPLOAD_DIRECTORY, filename)
    except FileNotFoundError:
        return send_from_directory(UPLOAD_DIRECTORY, 'default_avatar.png')