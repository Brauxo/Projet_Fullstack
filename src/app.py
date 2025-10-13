from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from config import Config
from models import User
from flask_migrate import Migrate 

# Init Flask
app = Flask(__name__)
app.config.from_object(Config)

# Init db
db = SQLAlchemy(app)
migrate = Migrate(app, db)


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

if __name__ == '__main__':
    app.run(debug=True, port=5000)