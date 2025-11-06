# Full stack project

    ```bash
    docker-compose down
    ```
    ```bash
    docker-compose up --build
    ```

Base de données

`docker-compose up -d db`

Attention si nouvelle machine il faut upgrade la db : 

`docker-compose exec backend flask db upgrade`

Cela va démarrer **uniquement** le service `db` (PostgreSQL) en arrière-plan. La base de données sera accessible sur `localhost:5432`, comme si elle était installée localement.

Serveur Flask 

`cd src`
`flask run`

Front 

`cd ui`
`npm start`

Important : La configuration du proxy
Dans ce mode de travail, le proxy que nous avions mis dans ui/package.json doit pointer vers localhost pas vers backend.
Pour que React (sur localhost:3000) puisse parler à Flask (sur localhost:5000), la ligne "proxy": "http://localhost:5000" est nécessaire.


### 🛠 Outils :
| **Backend** | **Frontend** | **Full Stack** |
|---|-|---|
| <img src="" alt="python" style="height: 1em; vertical-align: middle;"> Python | <img src="" alt="react" style="height: 1em; vertical-align: middle;"> React | <img src="" alt="docker" style="height: 1em; vertical-align: middle;"> Docker |
| <img src="" alt="flask" style="height: 1em; vertical-align: middle;"> Flask |<img src="" alt="css" style="height: 1em; vertical-align: middle;"> CSS| |
| <img src="" alt="sqlalchemy" style="height: 1em; vertical-align: middle;"> SQLAlchemy | | |
| <img src="" alt="postgresql" style="height: 1em; vertical-align: middle;"> PostgreSQL | | |