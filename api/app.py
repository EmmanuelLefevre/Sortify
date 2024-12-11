from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

from classify_url import process_url


app = Flask(__name__)

# Application de CORS à toute l'application (middleware)
CORS(app, resources={
    r"/api/bookmark": {
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

if __name__ == '__main__':
    # Le mode debug active le rechargement automatique
    app.run(debug=True)
