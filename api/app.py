import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
from dotenv import load_dotenv
import uuid

from classify_url import process_url


load_dotenv()
PATH_DATAMODEL = os.getenv('DATAMODEL')
with open(PATH_DATAMODEL, 'r') as f:
    DATAMODEL = json.load(f)

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
    }
})


@app.route('/api/bookmark', methods=['POST'])
def fetch_data():
    data = request.get_json()
    url = data.get('url')
    user_agent = data.get('userAgent')
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    if not user_agent:
        return jsonify({'error': 'User-Agent is required'}), 400

    try:
        response, status = process_url(url, user_agent)
        return jsonify(response), status

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500



@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        return jsonify(DATAMODEL.get("categories", {})), 200

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/category', methods=['POST'])
def post_data():
    try:
        category = request.get_json()
        category_uuid = str(uuid.uuid4())
        DATAMODEL["categories"][category_uuid] = category

        with open(PATH_DATAMODEL, "w") as f:
            json.dump(DATAMODEL, f, indent=4)

        return jsonify({"label":category}),201

    except Exception as e :
        return jsonify({'error': str(e)}), 500




if __name__ == '__main__':
    # Le mode debug active le rechargement automatique
    app.run(debug=True)
