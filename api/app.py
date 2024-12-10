from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

from classify_url import answer_question


app = Flask(__name__)

# Application de CORS à toute l'application (permettre les requêtes de toutes les origines par défaut)
CORS(app)

@app.route('/fetch-data', methods=['POST'])
def fetch_data():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        label = answer_question(url)
        try:
            return label, 200
        except Exception:
            return str(label), 500
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Le mode debug active le rechargement automatique
    app.run(debug=True)
