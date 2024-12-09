import uuid
import json
import requests
from bs4 import BeautifulSoup


API_URL = "http://localhost:11434/api/generate"

PATH_DATAMODEL = "/home/camille/code/Camille9999/EPSI/integration-donnee/Sortify/api/datamodel.json"
with open(PATH_DATAMODEL, "r") as f:
    DATAMODEL = json.load(f)


def scrape_page(url):
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract title
        title = soup.title.string if soup.title else 'No title'

        # Extract all meta tags
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
    else:
        return None


def create_prompt(url, scraped_data):
    prompt = f"URL: {url}\n"
    prompt += f"Titre de page: {scraped_data['title']}\n"
    if scraped_data.get('meta_info').get('title'):
        prompt += f"Meta titre: {scraped_data.get('meta_info').get('title')}\n"
    if scraped_data.get('meta_info').get('description'):
        prompt += f"Meta description: {scraped_data.get('meta_info').get('description')}\n"
    if scraped_data.get('meta_info').get('keywords'):
        prompt += f"Meta keywords: {scraped_data.get('meta_info').get('keywords')}\n"
    categories = list(DATAMODEL.get("categories").values())
    prompt += f"Catégorise cet url selon les informations ci-dessus en choisissant la catégorie de la plus appropriée dans la liste suivante : {categories}. Ta réponse doit consister uniquement de la catégorie."
    return prompt



def answer_question(url, model="llama3.2"):

    for key, val in DATAMODEL.get("urls").items():
        if url == val.get('url'):
            category_id = val.get('category_id')
            label = DATAMODEL.get("categories").get(category_id)
            return label

    scraped_data = scrape_page(url)
    prompt = create_prompt(url, scraped_data)
    query = {
        "model": model,
        "prompt": prompt,
        "temperature": 0,
        "stream": False,
        "options": {
            "seed": 42  # Fixed seed for reproducibility
        }
    }
    response = requests.post(API_URL, json=query)
    label = response.json().get('response')
    label = label.split('\n')[-1]
    label = label[:-1] if label[-1] == '.' else label
    label = label.replace("'", "")
    try:
        label_id = [key for key, value in DATAMODEL.get("categories").items() if value == label][0]
        DATAMODEL.get("urls")[str(uuid.uuid4())] = {
                "url": url,
                "title": scraped_data.get('title'),
                "category_id": label_id
            }
        with open(PATH_DATAMODEL, "w") as f:
            json.dump(DATAMODEL, f, indent=4)
        return DATAMODEL.get("categories").get(label_id)
    except Exception as _:
        return "Something went wrong"
