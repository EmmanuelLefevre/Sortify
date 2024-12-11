import os
import uuid
import json
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()
PATH_DATAMODEL = os.getenv("DATAMODEL")


API_URL = "http://localhost:11434/api/generate"  # API ollama

with open(PATH_DATAMODEL, "r") as f:
    DATAMODEL = json.load(f)



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
    title = soup.title.string if soup.title else 'No title'
    meta_tags = soup.find_all('meta')
    meta_info = {}
    for tag in meta_tags:
        if 'name' in tag.attrs and 'content' in tag.attrs:
            if tag.attrs['name'] in ['title', 'description', 'keywords']:
                meta_info[tag.attrs['name']] = tag.attrs['content']
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
    if scraped_data.get('meta_info').get('title'):
        prompt += f"Meta titre: {scraped_data.get('meta_info').get('title')}\n"
    if scraped_data.get('meta_info').get('description'):
        prompt += f"Meta description: {scraped_data.get('meta_info').get('description')}\n"
    if scraped_data.get('meta_info').get('keywords'):
        prompt += f"Meta keywords: {scraped_data.get('meta_info').get('keywords')}\n"
    categories = list(DATAMODEL.get("categories").values())
    prompt += f"Catégorise cet url selon les informations ci-dessus en choisissant la catégorie la plus appropriée dans la liste suivante : {categories}. Ta réponse doit consister uniquement de la catégorie."
    return prompt


def post_process_label(label: str) -> str:
    """
    Fonction permettant de nettoyer la sortie du LLM afin de s'assurer qu'elle correspond bien à une catégorie existante.
    """
    label = label.split('\n')[-1]
    label = label[:-1] if label[-1] == '.' else label
    label = label.replace("'", "")
    return label


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
        label = post_process_label(label)
        label_id = [key for key, value in DATAMODEL.get("categories").items() if value == label][0]
        title = scraped_data.get('title')
        DATAMODEL.get("urls")[str(uuid.uuid4())] = {
                "url": url,
                "title": title,
                "category_id": label_id
            }
        with open(PATH_DATAMODEL, "w") as f:
            json.dump(DATAMODEL, f, indent=4)

        return {"label": label, "title": title}, 200

    except Exception as e:
        return {"error": f"Something went wrong: {e}"}, 500
