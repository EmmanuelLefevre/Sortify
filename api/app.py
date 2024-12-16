import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
from dotenv import load_dotenv
import uuid

from classify_url import process_url

# Charger variables d'environnement
load_dotenv()

# Chemin fichier modèle de données
PATH_DATAMODEL = os.getenv('DATAMODEL')

# Ouvrir fichier modèle de données
with open(PATH_DATAMODEL, 'r') as f:
    # Charger JSON dans DATAMODEL sous forme de dictionnaire
    DATAMODEL = json.load(f)



# Initialiser application Flask
app = Flask(__name__)



# Application de CORS à toute l'application (middleware)
CORS(app, resources={
    r"/api/bookmark": {
        "origins": "*",
        "methods": ["POST"]
    },
    r"/api/categories": {
        "origins": "*",
        "methods": ["GET"]
    },
    r"/api/category": {
        "origins": "*",
        "methods": ["POST"]
    },
    r"/api/category/<uuid>": {
        "origins": "*",
        "methods": ["PATCH", "DELETE"]
    }
})


# Ajouter un favori
@app.route('/api/bookmark', methods=['POST'])
def fetch_data():
    data = request.get_json()
    url = data.get('url')
    user_agent = data.get('userAgent')

    # Vérifier URL et User-Agent sont présents dans la requête
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    if not user_agent:
        return jsonify({'error': 'User-Agent is required'}), 400

    # Vérifier si URL existe déjà
    existing_urls = [entry['url'] for entry in DATAMODEL.get('urls', {}).values()]
    if url in existing_urls:
        return jsonify({"type": "bookmark"}), 409

    try:
        # Traiter URL
        response, status = process_url(url, user_agent)

        return jsonify(response), status

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500




# Fonction pour trier les catégories par leur nom
def sort_categories_by_name(categories):
    return sorted(categories.items(), key=lambda item: item[1])

# Récupérer les catégories
@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        # Récupérer catégories depuis le modèle de données
        categories = {
            cat_id: label
            for cat_id, label in DATAMODEL.get("categories", {}).items()
            if cat_id != "4bf563ec-34ff-4db7-9bbb-df0cc089b6a9"
        }

        # Trier catégories
        sorted_categories = sort_categories_by_name(categories)

        return jsonify(sorted_categories), 200

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500




# Ajouter une catégorie
@app.route('/api/category', methods=['POST'])
def post_data():
    try:
        data = request.get_json()
        category = data.get('name')

        # Vérifier si catégorie existe déjà
        if category in DATAMODEL["categories"].values():
            return jsonify({"type": "category"}), 409

        # Créer nouvel UUID pour la catégorie
        category_uuid = str(uuid.uuid4())

        # Ajouter catégorie au modèle de données
        DATAMODEL["categories"][category_uuid] = category

        # Sauvegarder modèle de données
        with open(PATH_DATAMODEL, "w") as f:
            json.dump(DATAMODEL, f, indent=4)

        return jsonify({"uuid": category_uuid, "label": category}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500




# Modifier une catégorie
@app.route('/api/category/<uuid>', methods=['PATCH'])
def patch_category(uuid):
    try:
        data = request.get_json()
        new_label = data.get('newCategoryName')

        # Vérifier si UUID fourni existe dans les catégories du modèle de données
        if uuid in DATAMODEL["categories"] and uuid != "4bf563ec-34ff-4db7-9bbb-df0cc089b6a9":
            # Si UUID existe => modifier la catégorie
            DATAMODEL["categories"][uuid] = new_label

            # Sauvegarder les changements
            with open(PATH_DATAMODEL, "w") as f:
                json.dump(DATAMODEL, f, indent=4)

            return jsonify({"uuid": uuid, "label": new_label}), 200
        else:
            return jsonify({'error': 'UUID not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500




# Supprimer une catégorie
@app.route('/api/category/<uuid>', methods=['DELETE'])
def delete_category(uuid):
    try:
        # Vérifier si UUID fourni existe dans les catégories du modèle de données
        if uuid in DATAMODEL["categories"] and uuid != "4bf563ec-34ff-4db7-9bbb-df0cc089b6a9":
            # Si UUID existe => supprimer la catégorie
            del DATAMODEL["categories"][uuid]

            # Sauvegarder les changements
            with open(PATH_DATAMODEL, "w") as f:
                json.dump(DATAMODEL, f, indent=4)

            return jsonify({"uuid": uuid, "message": "Category deleted"}), 200
        else:
            return jsonify({'error': 'UUID not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500




if __name__ == '__main__':
    # Le mode debug active le rechargement automatique
    app.run(debug=True)
