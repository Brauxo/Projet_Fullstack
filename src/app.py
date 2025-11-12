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


from models import User, Thread, Post
from auth import register, login
from users import get_user_profile, upload_avatar, get_public_user_profile, delete_user_profile
from threads import create_thread, get_all_threads, get_thread_details, check_thread_exists, delete_thread, toggle_like_thread
from posts import create_post_in_thread, update_post, delete_post
from uploads import serve_upload
from games import search_games



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

@app.route('/api/threads/<int:thread_id>', methods=['DELETE'])
@jwt_required()
def delete_thread_route(thread_id):
    return delete_thread(thread_id)

@app.route('/api/threads/<int:thread_id>/like', methods=['POST'])
@jwt_required()
def like_thread_route(thread_id):
    return toggle_like_thread(thread_id)

@app.route('/api/threads/<int:thread_id>/posts', methods=['POST'])
@jwt_required()
def post_reply(thread_id):
    return create_post_in_thread(thread_id)

@app.route('/api/posts/<int:post_id>', methods=['PUT']) # ou 'PATCH'
@jwt_required()
def update_post_route(post_id):
    return update_post(post_id)

@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post_route(post_id):
    return delete_post(post_id)

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

@app.route('/api/users/me', methods=['DELETE'])
@jwt_required()
def delete_user():
    return delete_user_profile()

@app.route('/api/games/search', methods=['GET'])
@jwt_required()
def search_games_route():
    return search_games()

@app.route('/api/threads/check_game/<int:rawg_game_id>', methods=['GET'])
@jwt_required()
def check_game_thread(rawg_game_id):
    return check_thread_exists(rawg_game_id)


if __name__ == '__main__':
    app.run(debug=True, port=5000)