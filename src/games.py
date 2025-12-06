from flask import request, jsonify, current_app
import requests


def search_games():
    """
    Recherche de jeux.
    Récupère texte de la barre de recherche (paramètre 'q'),
    puis demande à l'API de RAWG de trouver les jeux correspondants
    Renvoie une liste simplifiée (juste nom, image, id) pour l'affichage.
    """
    query = request.args.get('q')
    if not query:
        return jsonify({"message": "Une requête de recherche (q) est requise"}), 400

    api_key = current_app.config.get('RAWG_API_KEY')
    if not api_key:
        return jsonify({"message": "Clé API RAWG manquante"}), 500

    try:
        params = {
            'key': api_key,
            'search': query,
            'page_size': 5
        }
        response = requests.get("https://api.rawg.io/api/games", params=params)
        response.raise_for_status()

        data = response.json()

        results = []
        for game in data.get('results', []):
            results.append({
                "id": game.get('id'),
                "name": game.get('name'),
                "background_image": game.get('background_image')
            })

        return jsonify(results)

    except Exception as e:
        return jsonify({"message": f"RAWG API Error: {str(e)}"}), 500