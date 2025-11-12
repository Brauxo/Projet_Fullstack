from flask import request, jsonify, current_app
import requests


def search_games():
    """
    Route pour rechercher des jeux en utilisant l'API RAWG.io.
    Prend un paramètre 'q' dans l'URL (ex: /api/games/search?q=cyberpunk)
    """
    query = request.args.get('q')
    if not query:
        return jsonify({"message": "Une requête de recherche (q) est requise"}), 400

    api_key = current_app.config.get('RAWG_API_KEY')
    if not api_key:
        # Assure-toi d'avoir RAWG_API_KEY dans ton src/config.py
        return jsonify({"message": "Clé API RAWG non configurée"}), 500

    try:
        params = {
            'key': api_key,
            'search': query,
            'page_size': 5
        }
        response = requests.get("https://api.rawg.io/api/games", params=params)
        response.raise_for_status()

        data = response.json()

        simplified_results = []
        for game in data.get('results', []):
            simplified_results.append({
                "id": game.get('id'),
                "name": game.get('name'),
                "background_image": game.get('background_image')
            })

        return jsonify(simplified_results)

    except requests.exceptions.RequestException as e:
        return jsonify({"message": f"Erreur lors de la communication avec l'API RAWG: {e}"}), 500