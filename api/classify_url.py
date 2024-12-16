import os
import uuid
import json
import requests
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

    # Extraire première partie du domaine (avant le premier ".")
    domain_parts = domain.split('.')
    if not domain_parts or len(domain_parts) < 1:
        return "Invalide!"

    domain_name = domain_parts[0]

    return domain_name


def scrape_page(url: str, user_agent: str) -> dict | None:
    """
    Fonction scrapant une page web à partir de son url et récupérant des informations utiles pour la classifier.
    """
    headers = {
        "User-Agent": user_agent
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, 'html.parser')
    meta_tags = soup.find_all('meta')
    meta_info = {}

    for tag in meta_tags:
        if 'name' in tag.attrs and 'content' in tag.attrs:
            if tag.attrs['name'] in ['title', 'description', 'keywords']:
                meta_info[tag.attrs['name']] = tag.attrs['content']
    title = soup.title.string if soup.title else meta_info.get('title', format_url(url))

    return {
        'title': title,
        'meta_info': meta_info
    }


def create_prompt(url: str, scraped_data: dict) -> str:
    """
    Fonction générant le prompt à partir des informations récupérées.
    """
    prompt = f"URL: {url}\n"
    prompt += f"Titre de page: {scraped_data['title']}\n"

    meta_title = scraped_data.get('meta_info', {}).get('title', '')

    if meta_title:
        prompt += f"Meta titre: {meta_title}\n"
    if scraped_data.get('meta_info').get('description'):
        prompt += f"Meta description: {scraped_data.get('meta_info').get('description')}\n"
    if scraped_data.get('meta_info').get('keywords'):
        prompt += f"Meta keywords: {scraped_data.get('meta_info').get('keywords')}\n"

    categories = [value for value in DATAMODEL.get("categories").values() if value != "Autre"]

    prompt += f"Catégorise cette url selon les informations ci-dessus en choisissant la catégorie la plus appropriée dans la liste suivante : {categories}. Ta réponse ne doit être que l'une de celles contenues dans la liste des catégories."
    return prompt


def post_process_label(label: str) -> str:
    """
    Fonction permettant de nettoyer la sortie du LLM afin de s'assurer qu'elle correspond bien à une catégorie existante.
    """
    try:
        label = label.split('\n')[-1]
        label = label[:-1] if label[-1] == '.' else label
        label = label.replace("'", "")
        return label
    except Exception:
        return ""


def process_url(url: str, user_agent: str, model: str = "llama3.2") -> tuple[dict, int]:

    for _, val in DATAMODEL.get("urls").items():
        if url == val.get('url'):
            category_id = val.get('category_id')
            label = DATAMODEL.get("categories").get(category_id)
            title = val.get('title')
            return {"label": label, "title": title}, 200

    try:
        scraped_data = scrape_page(url, user_agent)
    except Exception as e:
        return {"error": f"url inaccessible : {e}"}, 500

    query = {
        "model": model,
        "prompt": create_prompt(url, scraped_data),
        "temperature": 0,
        "stream": False,
        "options": {
            "seed": 42  # Fixed seed for reproducibility (temperature set at 0 doesn't seem to ensure a reproducible result for an indentical prompt)
        }
    }

    try:
        response = requests.post(API_URL, json=query)
        label = response.json().get('response')

        # Nettoyer le label
        label = post_process_label(label)

        # Vérifier que le label correspond à une catégorie existante
        label_id = [key for key, value in DATAMODEL.get("categories").items() if value == label]
        label_id = label_id[0] if label_id else "4bf563ec-34ff-4db7-9bbb-df0cc089b6a9"

        title = scraped_data.get('title')

        # Ajouter l'URL et ses informations au modèle
        DATAMODEL.get("urls")[str(uuid.uuid4())] = {
                "url": url,
                "title": title,
                "category_id": label_id
            }

        # Sauvegarder les modifications dans le fichier
        with open(PATH_DATAMODEL, "w") as f:
            json.dump(DATAMODEL, f, indent=4)

        return {"label": label, "title": title}, 200

    except Exception as e:
        return {"error": f"Something went wrong: {e}"}, 500
