from flask import Flask, jsonify
from config import Config
from flask_migrate import Migrate
from extensions import db
from auth import register

# Init Flask
app = Flask(__name__)
app.config.from_object(Config)

# Init db
db.init_app(app)
migrate = Migrate(app, db)

from models import User # A importer après la DB !!

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)