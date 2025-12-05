⚠ Disclaimer : this README.md is in French, use translater if needeed

Il y a des balises html dans ce fichier, s'il y a un problème d'affichage, essayez de l'ouvrir ailleurs (e.g. depuis GitHub).

<hr>

# GitHub README - GameHub
<div style="text-align: center;">
<img src="ui/src/assets/logo.svg" alt="banner" style="horiz-align: center; width: 100px;">
</div>

![Static Badge](https://img.shields.io/badge/ESIEE%20Paris%20-%20Projet%20FullStack%20-%20orangered?style=flat)
![GitHub last commit](https://img.shields.io/github/last-commit/votre-nom/GameHub)
![GitHub repo size](https://img.shields.io/github/repo-size/votre-nom/GameHub)

### 🛠 Outils : 
| **Backend** | **Frontend** | **Full Stack** |
|------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| <img src="https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" alt="python" style="height: 1em; vertical-align: middle;"> Python             | <img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg" alt="javascript" style="height: 1em; vertical-align: middle;"> JavaScript                                                                                                                                                                                                   | <img src="https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png" alt="docker" style="height: 1em; vertical-align: middle;"> Docker |
| <img src="https://flask.palletsprojects.com/en/3.0.x/_static/flask-icon.png" alt="flask" style="height: 1em; vertical-align: middle;"> Flask          | <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="react" style="height: 1em; vertical-align: middle;"> React (CRA)                                                                                                                   |                                                                                                |
| <img src="https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg" alt="postgresql" style="height: 1em; vertical-align: middle;"> PostgreSQL | <img src="https://lucide.dev/logo.light.svg" alt="lucide" style="height: 1em; vertical-align: middle;"> Lucide Icons + <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg" alt="css" style="height: 1em; vertical-align: middle;"> CSS Custom |                                                                                                |

### ☲ Description
Ce projet, réalisé dans le cadre de la matière **Fullstack Data**, est un **réseau social dédié aux jeux vidéo** (GameHub). 

Le backend est développé avec **Flask** en Python, utilisant une base de données **PostgreSQL** (via SQLAlchemy) pour gérer les utilisateurs, les fils de discussion (threads) et les commentaires. Une particularité de ce projet est l'intégration de l'**API externe RAWG.io**, permettant aux utilisateurs de rechercher des jeux réels et de créer des discussions liées à des fiches de jeux existantes.

Le frontend est construit avec **React** en JavaScript, assurant une interface fluide et réactive. La sécurité est gérée via des **JWT (JSON Web Tokens)**.

### 👁 Résultat du projet

*(Insérez ici un GIF ou une capture d'écran de votre application si disponible)*

![demo](https://placehold.co/600x400?text=Demo+Placeholder)

<hr>

## Table des matières
### Guide de l’utilisateur
1) [Avant tout](#1---avant-tout) 
2) [Configuration API](#2---configuration-api)
3) [Lancer le projet](#3---lancer-le-projet)
4) [Utiliser l'application Web](#4---utiliser-lapplication-web)

### Guide du développeur
1) [Aperçu global](#1---aperçu-global) 
2) [Backend](#2---backend) 
3) [Frontend](#3---frontend)
4) [Continuer le projet](#4---continuer-le-projet)

### Contexte et Retours d'expérience
1) [Pourquoi ce projet](#1---pourquoi-ce-projet) 
2) [Difficultés rencontrées](#2---difficultés-rencontrées) 

<hr>

## Guide de l'utilisateur

### 1 - Avant tout

Dans un premier temps, vous devez installer
**`<a href="https://www.docker.com/products/docker-desktop/" target="_blank">`{=html}Docker
Desktop`</a>`{=html}** pour faire fonctionner le projet.

Faites une installation classique.

### 2 - Configuration API

Ce projet utilise l'API **RAWG** pour récupérer les données des jeux
vidéo. La clé API ne doit pas être commise dans le code.

1.  Récupérez votre clé API (fournie avec le rendu ou gratuite sur
    [RAWG.io](https://rawg.io/apidocs)).
2.  À la racine du projet, trouvez le fichier **`.env.example`**.
3.  Renommez-le simplement en **`.env`** (ou faites-en une copie nommée
    `.env`).
4.  Ouvrez ce fichier `.env` et remplacez la valeur par votre clé :
    `env     RAWG_API_KEY=votre_vraie_clé_ici`

### 3 - Lancer et Initialiser le projet

Tout d'abord, veuillez lancer l'application **Docker Desktop**.

Rejoignez le dossier du projet dans un terminal (PowerShell recommandé)
:

``` bash
$ cd chemin/vers/le/projet
```

1.  Nettoyage (Recommandé pour une installation propre)\
    Si vous avez déjà lancé le projet auparavant, supprimez le volume de
    données pour repartir de zéro :

``` bash
Remove-Item -Recurse -Force data
```

(Si le dossier n'existe pas ou si c'est la première fois, ignorez cette
étape).

2.  Lancement des conteneurs\
    Construisez et démarrez les services :

``` bash
docker compose up --build -d
```

Patientez que les services (backend, db, ui) soient tous démarrés.

3.  Remplissage de la base de données (Seed)\
    La base de données est vide au démarrage. Pour créer des
    utilisateurs, importer des jeux via l'API et générer de l'activité,
    lancez ce script :

``` bash
docker compose exec backend python seed_db.py
```

Une fois le script terminé, ouvrez votre navigateur à l'adresse :
`<a href="http://localhost:3000" target="_blank">`{=html}http://localhost:3000`</a>`{=html}


### 4 - Utiliser l'application Web

⚠ **Note :** La base de données est vide au lancement. Vous devrez créer un premier compte utilisateur.

Le réseau social **GameHub** permet de :
* **S'inscrire / Se connecter** : Gestion complète de l'authentification.
* **Rechercher des jeux** : Utilisez la barre de recherche ou la page de création pour trouver un jeu via l'API RAWG.
* **Créer des Threads** : Lancez une discussion sur un jeu spécifique. Si le sujet existe déjà, vous rejoignez la conversation.
* **Interagir** : Commentez les posts et "Likez" les sujets intéressants.
* **Profil** : Modifiez votre avatar (upload d'image), votre bio, ou supprimez votre compte (Zone de danger).

#### Les différentes pages

- **Connexion / Inscription** : Interface simple pour accéder à la plateforme.
- **Accueil** : Flux d'actualité des derniers sujets créés.
- **Créer un sujet** : Recherche en temps réel d'un jeu via RAWG, sélection, et rédaction du premier message.
- **Page du sujet** : Détails du jeu (provenant de RAWG : note Metacritic, date de sortie, genres) à gauche, et fil de discussion à droite.
- **Profil** : Gestion des informations personnelles et visualisation de ses propres contributions.

<hr>

## Guide du développeur

### 1 - Aperçu global

L'application suit une architecture **Full Stack** séparée :
* **Backend** : API RESTful exposée sur le port 5000.
* **Frontend** : SPA (Single Page Application) React sur le port 3000.
* **Database** : Conteneur PostgreSQL sur le port 5432.

### 2 - Backend (Flask)

Le backend est structuré de manière modulaire dans le dossier `src/` :
* `app.py` : Point d'entrée de l'application, initialisation des routes.
* `models.py` : Définition des modèles SQLAlchemy (`User`, `Thread`, `Post`) et tables d'association (`thread_likes`).
* `auth.py` : Gestion de l'inscription et du login (hachage des mots de passe avec `werkzeug`, génération de token `flask_jwt_extended`).
* `games.py` : Logique de communication avec l'API tierce RAWG.
* `routes/` : (Logique répartie dans les fichiers racines `users.py`, `threads.py`, `posts.py` pour ce projet).

Nous utilisons **Flask-Migrate** (Alembic) pour gérer les évolutions du schéma de base de données.

### 3 - Frontend (React)

Le frontend est généré avec `Create React App`.
* `src/pages/` : Contient les vues principales (`HomePage`, `ThreadPage`, `ProfilePage`, etc.).
* `src/services/api.js` : Configuration d'Axios avec un intercepteur pour injecter automatiquement le token JWT dans les headers.
* `src/App.css` : Styles globaux (thème sombre par défaut).

### 4 - Pour les tests
``` bash
# Lancer les tests
pytest -v
```
``` bash
# Lancer les tests via docker
docker compose exec backend pytest
```


### 5 - Continuer le projet

Pistes d'amélioration :
* **Sécurité** : Passer en HTTPS et stocker les tokens dans des cookies `HttpOnly` plutôt que le `localStorage`.
* **Fonctionnalités** : Ajouter un système de "Follow" entre utilisateurs (la base est là avec les profils).
* **Performance** : Mettre en cache les requêtes vers RAWG pour limiter les appels API externes.

<hr>

## Contexte et Retours d'expérience

### 1 - Pourquoi ce projet

Nous avons opté pour un **réseau social de gaming** car il permettait de combiner plusieurs défis techniques intéressants :
1.  La gestion d'une base de données relationnelle (Utilisateurs / Posts / Commentaires).
2.  L'intégration d'une **API Externe (RAWG)** pour enrichir le contenu sans avoir à remplir manuellement la base de données de jeux.
3.  La gestion de l'upload de fichiers (Avatars utilisateurs).

### 2 - Difficultés rencontrées

* **Gestion des images** : Nous avons mis en place un système d'upload d'avatars stockés localement dans le dossier `uploads/` et servis statiquement par Flask (`send_from_directory`), ce qui a demandé une configuration spécifique des volumes Docker.
* **Relations SQL** : La mise en place de la table d'association pour les "Likes" (`thread_likes`) et la gestion des cascades (supprimer un user supprime ses posts) a nécessité une attention particulière avec SQLAlchemy.
* **React & Asynchronicité** : Gérer les états de chargement lors des appels à l'API RAWG (barre de recherche avec debounce) a été un bon exercice de gestion d'état frontend.

Merci du temps que vous avez consacré à cette lecture.
