from flask import Flask, request, jsonify
import requests
import json

from classify_url import answer_question


app = Flask(__name__)

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
        except:
            return str(label), 500
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
