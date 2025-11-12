from extensions import db
import datetime

# Table d'association pour les likes de sujets (threads)
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

    # Forum relationships
    threads = db.relationship('Thread', backref='author', lazy=True, cascade="all, delete-orphan")
    posts = db.relationship('Post', backref='author', lazy=True, cascade="all, delete-orphan")

    # Relation pour les sujets (threads) likés
    liked_threads = db.relationship('Thread', secondary=thread_likes, lazy='dynamic',
                                    backref=db.backref('liked_by', lazy='dynamic'))

    avatar_url = db.Column(db.String(255), nullable=True)

    def __repr__(self):
        return f'<User {self.username}>'


class Thread(db.Model):
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

    # --- NOUVEAUX CHAMPS DE JEU ---
    metacritic = db.Column(db.Integer, nullable=True)
    released = db.Column(db.String(50), nullable=True) # Date de sortie
    website = db.Column(db.String(255), nullable=True)
    # On va stocker les genres et plateformes comme du texte simple
    genres = db.Column(db.Text, nullable=True)
    platforms = db.Column(db.Text, nullable=True)
    # --- FIN DES NOUVEAUX CHAMPS ---

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