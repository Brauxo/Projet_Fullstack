from flask import Flask, jsonify
from config import Config
from flask_migrate import Migrate
from extensions import db
from flask_jwt_extended import JWTManager, jwt_required

# Init Flask
app = Flask(__name__)
app.config.from_object(Config)

# Init db
db.init_app(app)
migrate = Migrate(app, db)
# Init extensions
jwt = JWTManager(app)


from models import User, Thread, Post # A importer après la DB !!
from auth import register, login
from users import get_user_profile, upload_avatar, get_public_user_profile
from threads import create_thread, get_all_threads, get_thread_details
from posts import create_post_in_thread
from uploads import serve_upload

# Modèle db (on le mettra dans un autre fichier plus tard)
# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(80), unique=True, nullable=False)
#     email = db.Column(db.String(120), unique=True, nullable=False)

#     def __repr__(self):
#         return f'<User {self.username}>'


@app.route('/api/hello')
def hello_world():
    return jsonify(message="Hello from Flask!")

@app.route('/api/register', methods=['POST'])
def register_user():
    return register()

@app.route('/api/login', methods=['POST'])
def login_user():
    return login()

@app.route('/api/profile', methods=['GET'])
@jwt_required() # Protection
def profile():
    return get_user_profile()

@app.route('/api/threads', methods=['POST'])
@jwt_required()
def post_thread():
    return create_thread()

@app.route('/api/threads', methods=['GET'])
def list_threads():
    return get_all_threads()

@app.route('/api/threads/<int:thread_id>', methods=['GET'])
def get_single_thread(thread_id):
    return get_thread_details(thread_id)

@app.route('/api/threads/<int:thread_id>/posts', methods=['POST'])
@jwt_required()
def post_reply(thread_id):
    return create_post_in_thread(thread_id)

@app.route('/api/profile/avatar', methods=['POST'])
@jwt_required()
def post_avatar():
    return upload_avatar()

@app.route('/uploads/<path:filename>')
def get_upload(filename):
    return serve_upload(filename)

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    return get_public_user_profile(user_id)

if __name__ == '__main__':
    app.run(debug=True, port=5000)