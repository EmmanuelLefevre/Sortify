import os
import uuid
import json
import requests
import re
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from urllib.parse import urlparse


load_dotenv()
PATH_DATAMODEL = os.getenv("DATAMODEL")

# Endpoint API Ollama
API_URL = "http://localhost:11434/api/generate"

with open(PATH_DATAMODEL, "r") as f:
    DATAMODEL = json.load(f)


# Fonction de formatage de l'URL
def format_url(url: str) -> str:
    # Parser l'URL pour extraire les composants
    parsed_url = urlparse(url)

    # Récupérer le domaine (netloc)
    domain = parsed_url.netloc

    # Si le domaine est vide, retourner "invalide"
    if not domain:
        return "Invalide!"

    # Supprimer "www." si présent
    if domain.startswith("www."):
        # Retirer les 4 premiers caractères
        domain = domain[4:]

    # # Diviser le domaine en parties en utilisant le point (.) comme séparateur
    domain_parts = domain.split('.')

    # Vérifier si le résultat de la division est vide ou invalide
    if not domain_parts or len(domain_parts) < 1:
        return "Invalide!"

    # Extraire la première partie du domaine (ex: "exemple" dans "exemple.com")
    domain_name = domain_parts[0]

    # Retourner le nom du domaine extrait
    return domain_name


# Fonction pour extraire les informations d'une page web
def scrape_page(url: str, user_agent: str) -> dict | None:
    # Définition du header de la requête
    headers = {
        "User-Agent": user_agent
    }

    # Effectuer une requête GET vers l'URL avec le header
    response = requests.get(url, headers=headers)

    # Lever une exception si la requête échoue (erreur HTTP 4xx ou 5xx)
    response.raise_for_status()

    # Analyser le contenu HTML de la réponse avec BeautifulSoup
    soup = BeautifulSoup(response.content, 'html.parser')

    # Récupérer tous les éléments <meta> dans le contenu HTML
    meta_tags = soup.find_all('meta')

    # Initialiser un dictionnaire pour stocker les informations des balises meta
    meta_info = {}

    # Parcourir chaque balise <meta> trouvée
    for tag in meta_tags:
        # Vérifier si la balise contient les attributs 'name' et 'content'
        if 'name' in tag.attrs and 'content' in tag.attrs:
            # Filtrer uniquement les balises meta ayant 'name' parmi 'title', 'description' ou 'keywords'
            if tag.attrs['name'] in ['title', 'description', 'keywords']:
                # Ajouter info dans le dictionnaire (nom = clé, contenu = valeur)
                meta_info[tag.attrs['name']] = tag.attrs['content']

    # Récupérer title à partir de la balise <title> si elle existe
    # Sinon, utiliser title extrait dans les balises meta
    # Fallback => URL formatée
    title = soup.title.string if soup.title else meta_info.get('title', format_url(url))

    # Retourner dictionnaire (title + infos balises meta)
    return {
        'title': title,
        'meta_info': meta_info
    }


# Fonction générant le prompt à partir des informations récupérées.
def create_prompt(url: str, scraped_data: dict) -> str:
    # Initialiser le prompt (URL + title)
    prompt = f"URL: {url}\n"
    prompt += f"Titre de page: {scraped_data['title']}\n"

    # Récupérer title des balises meta s'il existe
    meta_title = scraped_data.get('meta_info', {}).get('title', '')

    # Vérifier si title meta existe => ajouter au prompt
    if meta_title:
        prompt += f"Meta titre: {meta_title}\n"

    # Vérifier si meta description existe => ajouter au prompt
    if scraped_data.get('meta_info').get('description'):
        prompt += f"Meta description: {scraped_data.get('meta_info').get('description')}\n"

    # Vérifier si meta keywords existent => ajouter au prompt
    if scraped_data.get('meta_info').get('keywords'):
        prompt += f"Meta keywords: {scraped_data.get('meta_info').get('keywords')}\n"

    # Récupérer liste des catégories disponibles, en excluant la catégorie "Autre"
    categories = [value for value in DATAMODEL.get("categories").values() if value != "Autre"]

    # Génération du prompt
    prompt += f"Catégorise cette url selon les informations ci-dessus en choisissant la catégorie la plus appropriée dans la liste suivante : {categories}. Ta réponse doit consister uniquement de la catégorie."

    # Retourner le prompt final
    return prompt


# Fonction de post-traitement d'une étiquette (label) pour la nettoyer
def post_process_label(label: str) -> str:
    try:
        # Diviser string en lignes à l'aide du délimiteur '\n' et conserver la dernière ligne
        label = label.split('\n')[-1]
        # Vérifier si dernier caractère est un point (.) => le supprimer si c'est le cas
        label = label[:-1] if label[-1] == '.' else label
        # Retirer tous les apostrophes simples (') de la chaîne
        label = label.replace("'", "")

        # Retourner le label nettoyé
        return label

    except Exception:
        return ""


# Fonction pour traiter une URL et déterminer sa catégorie
def process_url(url: str, user_agent: str, model: str = "llama3.2") -> tuple[dict, int]:
    # Vérifier si URL existe déjà dans le datamodel
    for _, val in DATAMODEL.get("urls").items():
        # Comparer URL fournie avec celles existantes
        if url == val.get('url'):
            # Récupérer ID de la catégorie
            category_id = val.get('category_id')
            # Obtenir le nom de la catégorie
            label = DATAMODEL.get("categories").get(category_id)
            # Récupérer le titre associé
            title = val.get('title')
            # Retourner les infos si URL existe déjà
            return {"label": label, "title": title}, 200

    # Si URL n'existe pas => scraper les données de la page
    try:
        # Appel de la fonction pour scraper la page
        scraped_data = scrape_page(url, user_agent)

    # Erreur 500 si URL inaccessible
    except Exception as e:
        return {"error": f"url inaccessible : {e}"}, 500

    # Préparer paramètres => envoyer requête à l'API de catégorisation
    query = {
        # Spécifier odèle à utiliser
        "model": model,
        # Générer prompt à partir des données scrapées
        "prompt": create_prompt(url, scraped_data),
        "temperature": 0,
        "stream": False,
        "options": {
            # Fixed seed for reproducibility (temperature set at 0 doesn't seem to ensure a reproducible result for an indentical prompt)
            "seed": 42
        }
    }

    # Envoyer requête à l'API => obtenir prédiction
    try:
        # Envoyer requête POST à l'API
        response = requests.post(API_URL, json=query)
        # Extraire label de la réponse de l'API
        label = response.json().get('response')

        # Nettoyer le label en post-traitement
        label = post_process_label(label)

        # Vérifier que le label correspond à une catégorie existante
        label_id = [key for key, value in DATAMODEL.get("categories").items() if value == label]
        # Si aucune catégorie ne correspond, assigner la catégorie "Autre"
        if label_id == []:
            label_id = "4bf563ec-34ff-4db7-9bbb-df0cc089b6a9"
            label = "Autre"
        # Sinon récupérer ID de la catégorie correspondante
        else:
            label_id = label_id[0]

        # Récupérer title de la page scrapée
        title = scraped_data.get('title')

        # Ajouter URL + ses infos au modèle
        DATAMODEL.get("urls")[str(uuid.uuid4())] = {
            "url": url,
            "title": title,
            "category_id": label_id
        }

        # Sauvegarder les modifications dans le fichier JSON
        with open(PATH_DATAMODEL, "w") as f:
            json.dump(DATAMODEL, f, indent=4)

        # Retourner label + titre
        return {"label": label, "title": title}, 200

    except Exception as e:
        return {"error": f"Something went wrong: {e}"}, 500
