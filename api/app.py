from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

from classify_url import process_url


app = Flask(__name__)

# Application de CORS à toute l'application (permettre les requêtes de toutes les origines par défaut)
CORS(app)

@app.route('/api/bookmark', methods=['GET','POST'])
def fetch_data():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        response, status = process_url(url)
        return jsonify(response), status

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Le mode debug active le rechargement automatique
    app.run(debug=True)
