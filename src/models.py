from extensions import db
import datetime

thread_likes = db.Table('thread_likes',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('thread_id', db.Integer, db.ForeignKey('threads.id'), primary_key=True)
)


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    avatar_url = db.Column(db.String(255), nullable=True)

    # Forum relationships
    threads = db.relationship('Thread', backref='author', lazy=True, cascade="all, delete-orphan") #suppression en cascade
    posts = db.relationship('Post', backref='author', lazy=True, cascade="all, delete-orphan")

    # Relation pour les sujets (threads) likés
    liked_threads = db.relationship('Thread', secondary=thread_likes, lazy='dynamic',
                                    backref=db.backref('liked_by', lazy='dynamic'))


    def __repr__(self):
        return f'<User {self.username}>'


class Thread(db.Model):
    """
        Représente un sujet de discussion sur un jeu.
    """
    __tablename__ = 'threads'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)  # Sera le nom du jeu
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    posts = db.relationship('Post', backref='thread', lazy=True, cascade="all, delete-orphan")

    # Champs pour RAWG.IO
    rawg_game_id = db.Column(db.Integer, unique=True, index=True, nullable=True)
    game_image_url = db.Column(db.String(255), nullable=True)
    game_description = db.Column(db.Text, nullable=True)
    metacritic = db.Column(db.Integer, nullable=True)
    released = db.Column(db.String(50), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    genres = db.Column(db.Text, nullable=True)
    platforms = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<Thread {self.title}>'

class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    thread_id = db.Column(db.Integer, db.ForeignKey('threads.id'), nullable=False)

    def __repr__(self):
        return f'<Post {self.id}>'