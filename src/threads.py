from flask import request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity
from models import Thread, User, Post
from extensions import db
import requests
from collections import Counter

def create_thread():
    """
        Creation sujet discussion
        Logique : Si le sujet existe déjà pour ce jeu (via rawg_game_id)
        on ne le duplique pas, on ajoute juste le post à la suite
        else on utilise l'API RAWG pour récupérer les données du jeu
    """
    data = request.get_json()
    rawg_game_id = data.get('rawg_game_id')
    content = data.get('content')

    if not rawg_game_id:
        return jsonify({"message": "Un ID de jeu (rawg_game_id) est requis"}), 400

    if not content:
        return jsonify({"message": "Un contenu est requis"}), 400

    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"message": "Utilisateur non trouvé"}), 404

    thread = Thread.query.filter_by(rawg_game_id=rawg_game_id).first()
    status_code = 200
    message = "Post ajouté au sujet existant"

    if not thread:
        api_key = current_app.config.get('RAWG_API_KEY')
        if not api_key:
            return jsonify({"message": "Clé API RAWG non configurée"}), 500

        try:
            response = requests.get(f"https://api.rawg.io/api/games/{rawg_game_id}?key={api_key}")
            response.raise_for_status()
            game_data = response.json()

            def get_genres(data):
                genres_list = data.get('genres', [])
                return ", ".join([g['name'] for g in genres_list])

            def get_platforms(data):
                platforms_list = data.get('platforms', [])
                # La structure est { "platform": { "name": "PC" } }
                return ", ".join([p['platform']['name'] for p in platforms_list])

            thread = Thread(
                title=game_data.get('name', 'Titre inconnu'),
                author=user,
                rawg_game_id=rawg_game_id,
                game_image_url=game_data.get('background_image'),
                game_description=game_data.get('description_raw'),
                metacritic=game_data.get('metacritic'),
                released=game_data.get('released'),
                website=game_data.get('website'),
                genres=get_genres(game_data),
                platforms=get_platforms(game_data)
            )

            db.session.add(thread)
            db.session.flush()
            status_code = 201
            message = "Sujet créé avec succès"

        except requests.exceptions.RequestException as e:
            return jsonify({"message": f"Erreur lors de la récupération des détails du jeu: {e}"}), 502

    first_post = Post(content=content, author=user, thread=thread)
    db.session.add(first_post)
    db.session.commit()

    return jsonify({"message": message, "id": thread.id}), status_code


def get_all_threads():
    """
        Récupère la liste des threasds
        Avec gestions des filtres
    """

    genre_filter = request.args.get('genre')
    search_query = request.args.get('search')

    query = Thread.query

    if genre_filter:
        query = query.filter(Thread.genres.ilike(f'%{genre_filter}%'))

    if search_query:
        query = query.filter(Thread.title.ilike(f'%{search_query}%'))

    threads = query.order_by(Thread.created_at.desc()).all()
    threads_data = []
    for thread in threads:
        author_avatar_filename = thread.author.avatar_url or 'default_avatar.png'
        threads_data.append({
            "id": thread.id,
            "title": thread.title,
            "author_id": thread.author.id,
            "author_username": thread.author.username,
            "author_avatar_url": author_avatar_filename,
            "created_at": thread.created_at.isoformat(),
            "game_image_url": thread.game_image_url
        })
    return jsonify(threads_data)


def get_thread_details(thread_id):
    """
        Charge la page complète d'un sujet : infos du jeu + tous les posts.
    """
    thread = Thread.query.filter_by(id=thread_id).first_or_404(description="Sujet non trouvé")

    current_user_id_str = None
    try:
        current_user_id_str = get_jwt_identity()
    except Exception:
        pass

    has_liked_by_user = False

    if current_user_id_str:
        user = User.query.get(int(current_user_id_str))
        if user and thread in user.liked_threads:
            has_liked_by_user = True

    like_count = thread.liked_by.count()

    posts = Post.query.filter_by(thread_id=thread.id).order_by(Post.created_at.asc()).all()
    posts_data = []
    for post in posts:
        post_author_avatar_filename = post.author.avatar_url or 'default_avatar.png'
        posts_data.append({
            "id": post.id,
            "content": post.content,
            "author_id": post.author.id,
            "author_username": post.author.username,
            "author_avatar_url": post_author_avatar_filename,
            "created_at": post.created_at.isoformat()
        })

    thread_author_avatar_filename = thread.author.avatar_url or 'default_avatar.png'

    thread_details = {
        "id": thread.id,
        "title": thread.title,
        "author_id": thread.author.id,
        "author_username": thread.author.username,
        "author_avatar_url": thread_author_avatar_filename,
        "created_at": thread.created_at.isoformat(),
        "posts": posts_data,
        "game_image_url": thread.game_image_url,
        "game_description": thread.game_description,
        "rawg_game_id": thread.rawg_game_id,
        "like_count": like_count,
        "has_liked_by_user": has_liked_by_user,
        "metacritic": thread.metacritic,
        "released": thread.released,
        "website": thread.website,
        "genres": thread.genres,
        "platforms": thread.platforms
    }

    return jsonify(thread_details)


def check_thread_exists(rawg_game_id):
    """
    Fonction utile pour front pour savoir si le threads existe deja ou pas
    """
    thread = Thread.query.filter_by(rawg_game_id=rawg_game_id).first()
    if thread:
        return jsonify({"exists": True, "thread_id": thread.id}), 200
    else:
        return jsonify({"exists": False}), 200


def delete_thread(thread_id):
    """
    Suppression d'un thread avec verif que c est bien l auteur
    """
    current_user_id = get_jwt_identity()
    thread = Thread.query.get_or_404(thread_id)
    if thread.user_id != int(current_user_id):
        return jsonify({"message": "Action non autorisée. Vous n'êtes pas l'auteur de ce sujet."}), 403
    db.session.delete(thread)
    db.session.commit()
    return jsonify({"message": "Sujet supprimé avec succès"}), 200


def toggle_like_thread(thread_id):
    """
    Fonstion pour like sujet, mettre a jour table + incrementer compteur
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    thread = Thread.query.get_or_404(thread_id)
    if not user:
        return jsonify({"message": "Utilisateur non trouvé"}), 404
    if thread in user.liked_threads:
        user.liked_threads.remove(thread)
        db.session.commit()
        return jsonify({
            "message": "Like retiré",
            "liked": False,
            "like_count": thread.liked_by.count()
        }), 200
    else:
        user.liked_threads.append(thread)
        db.session.commit()
        return jsonify({
            "message": "Sujet liké",
            "liked": True,
            "like_count": thread.liked_by.count()
        }), 200


def get_top_genres():
    threads = Thread.query.filter(Thread.genres.isnot(None)).all()

    all_genres = []

    for thread in threads:
        if thread.genres:
            genres_list = [g.strip() for g in thread.genres.split(',')]
            all_genres.extend(genres_list)

    top_genres_counts = Counter(all_genres).most_common(10)
    top_genres_names = [genre[0] for genre in top_genres_counts]

    return jsonify(top_genres_names)