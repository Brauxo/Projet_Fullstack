import requests
import random
import time
from app import app
from extensions import db
from models import User, Thread, Post
from werkzeug.security import generate_password_hash

# --- CONFIGURATION ---

# 15 jeux variés
GAMES_TO_ADD = [
    "The Witcher 3: Wild Hunt",
    "Grand Theft Auto V",
    "Elden Ring",
    "Cyberpunk 2077",
    "Minecraft",
    "Red Dead Redemption 2",
    "God of War",
    "Hollow Knight",
    "League of Legends",
    "Valorant",
    "Baldur's Gate 3",
    "Zelda: Breath of the Wild",
    "Stardew Valley",
    "Overwatch 2",
    "Final Fantasy VII Remake"
]

# 50 Commentaires variés pour simuler une vraie communauté
SAMPLE_COMMENTS = [
    # Positifs
    "Ce jeu est une pure merveille artistique.",
    "J'ai passé 100h dessus et je n'ai toujours pas fini !",
    "Meilleur jeu de la décennie, sans débat.",
    "Les graphismes sont époustouflants pour l'époque.",
    "L'histoire m'a fait pleurer à la fin...",
    "Un chef d'oeuvre absolu, je recommande à 100%.",
    "La direction artistique est juste incroyable.",
    "Gameplay aux petits oignons, un régal.",
    "Je ne m'en lasse pas, c'est ma 3ème run.",
    "La bande son est incroyable, je l'écoute en boucle.",

    # Négatifs / Critiques
    "Franchement, c'est surcoté à mon avis.",
    "Le gameplay est un peu rigide au début.",
    "C'est bourré de bugs, attendez un patch.",
    "Je suis déçu par la fin, ça gâche tout.",
    "Les micro-transactions gâchent l'expérience.",
    "L'optimisation est catastrophique sur PC.",
    "Je préfère l'opus précédent personnellement.",
    "L'open world est vide, on s'ennuie vite.",
    "L'IA des ennemis est aux fraises.",

    # Questions / Entraide
    "Quelqu'un veut faire une partie ce soir ?",
    "Impossible de battre le boss du niveau 4, à l'aide !",
    "Vous savez où trouver l'épée légendaire ?",
    "Est-ce que ça tourne sur une config modeste ?",
    "Quelqu'un a un build à conseiller pour débuter ?",
    "Comment on débloque la fin secrète ?",
    "Vous me conseillez de jouer manette ou clavier ?",
    "C'est mieux en solo ou en coop ?",

    # Gaming Culture / Courts
    "GOTY.",
    "Masterclass.",
    "Ez.",
    "Skill issue.",
    "Git gud.",
    "F.",
    "Incroyable.",
    "Bof.",
    "A éviter.",

    # Spécifiques / Roleplay
    "C'est beaucoup mieux optimisé depuis la dernière mise à jour.",
    "Le mode multijoueur est addictif.",
    "L'ambiance est oppressante, j'adore.",
    "Les dialogues sont super bien écrits.",
    "Le système de craft est un peu complexe.",
    "J'ai ragequit 3 fois hier soir.",
    "Le matchmaking est cassé en ce moment.",
    "Vivement le DLC !",
    "C'est le Dark Souls des jeux de ferme.",
    "J'ai perdu ma save de 50h... je suis dégoûté.",
    "On se croirait dans un film.",
    "Le méchant est plus charismatique que le héros."
]


def get_genres_str(data):
    genres_list = data.get('genres', [])
    return ", ".join([g['name'] for g in genres_list])


def get_platforms_str(data):
    platforms_list = data.get('platforms', [])
    return ", ".join([p['platform']['name'] for p in platforms_list])


def seed():
    with app.app_context():
        api_key = app.config.get('RAWG_API_KEY')
        if not api_key:
            print("ERREUR: Pas de clé API RAWG configurée !")
            return

        print("--- NETTOYAGE DE LA BASE DE DONNÉES ---")
        db.drop_all()
        db.create_all()

        print("--- CRÉATION DES UTILISATEURS ---")
        users = []
        user_data = [
            ("PixelKnight", "pixel@gamehub.com"),
            ("RetroGamer88", "retro@gamehub.com"),
            ("FPS_Master", "fps@gamehub.com"),
            ("CozyBuilder", "cozy@gamehub.com"),
            ("SpeedRunner_X", "speed@gamehub.com"),
            ("RPG_Lover", "rpg@gamehub.com"),
            ("TrollFace", "troll@gamehub.com"),  # Nouveau
            ("CasualGamer", "casual@gamehub.com")  # Nouveau
        ]

        for username, email in user_data:
            u = User(
                username=username,
                email=email,
                password_hash=generate_password_hash("password", method='pbkdf2:sha256')
            )
            db.session.add(u)
            users.append(u)

        db.session.commit()
        print(f"{len(users)} utilisateurs créés.")

        print("--- RÉCUPÉRATION ET CRÉATION DES JEUX (VIA RAWG) ---")

        for game_name in GAMES_TO_ADD:
            try:
                # 1. Recherche
                print(f"Recherche de : {game_name}...")
                search_url = "https://api.rawg.io/api/games"
                params = {'key': api_key, 'search': game_name, 'page_size': 1}
                search_res = requests.get(search_url, params=params)
                search_res.raise_for_status()
                search_data = search_res.json()

                if not search_data['results']:
                    print(f" -> Pas trouvé : {game_name}")
                    continue

                game_summary = search_data['results'][0]
                game_id = game_summary['id']

                # 2. Détails
                details_url = f"https://api.rawg.io/api/games/{game_id}"
                details_res = requests.get(details_url, params={'key': api_key})
                details_res.raise_for_status()
                full_data = details_res.json()

                # 3. Thread
                author = random.choice(users)
                thread = Thread(
                    title=full_data.get('name'),
                    author=author,
                    rawg_game_id=full_data.get('id'),
                    game_image_url=full_data.get('background_image'),
                    game_description=full_data.get('description_raw'),
                    metacritic=full_data.get('metacritic'),
                    released=full_data.get('released'),
                    website=full_data.get('website'),
                    genres=get_genres_str(full_data),
                    platforms=get_platforms_str(full_data)
                )
                db.session.add(thread)

                # 4. Likes aléatoires
                potential_likers = list(users)
                random.shuffle(potential_likers)
                nb_likes = random.randint(0, len(users))
                for i in range(nb_likes):
                    thread.liked_by.append(potential_likers[i])

                # 5. BEAUCOUP DE POSTS (entre 3 et 10 par jeu)
                nb_posts = random.randint(3, 10)

                for _ in range(nb_posts):
                    commenter = random.choice(users)
                    content = random.choice(SAMPLE_COMMENTS)

                    # Petite chance (20%) d'ajouter un "C'est vrai" ou "Pas d'accord" pour simuler une discussion
                    if random.random() < 0.2:
                        prefix = random.choice(["Pas d'accord. ", "Exactement ! ", "Mdr, "])
                        content = prefix + content.lower()

                    post = Post(content=content, author=commenter, thread=thread)
                    db.session.add(post)

                print(f" -> Ajouté : {full_data.get('name')} | Likes: {nb_likes} | Posts: {nb_posts}")

                time.sleep(0.4)

            except Exception as e:
                print(f" -> Erreur sur {game_name}: {e}")

        db.session.commit()
        print("\n--- TERMINE ! BASE DE DONNÉES REMPLIE A RABORD ---")


if __name__ == '__main__':
    seed()