# SORTIFY

## SOMMAIRE
- [INTRODUCTION](#introduction)
- [CHROME EXTENSIONS SETTINGS](#chrome-extensions-settings)
- [API](#api)
  - [Installer Python](#installer-python)
  - [Installer Ollama](#installer-ollama)
  - [Requirements](#requirements)
  - [Procedure](#Procedure)
- [SERVEO CONFIGURATION](#serveo-configuration)
- [LIENS UTILES](#liens-utiles)

## INTRODUCTION
La gestion des favoris dans un navigateur peut devenir complexe à mesure que le nombre de liens enregistrés augmente. Afin de simplifier cette organisation Sortify utilise un Large Language Model (LLM) pour automatiser et optimiser le tri des favoris dans Chrome.  
Grâce à l'intégration de l'intelligence artificielle, cette extension ne se contente pas de trier vos favoris de manière basique, par ordre alphabétique ou URL, mais elle analyse également vos liens pour les regrouper en catégories intelligentes. Que vous ayez des favoris liés à la technologie, à l'éducation ou au divertissement l'extension suggère automatiquement les meilleures catégories pour mieux organiser vos liens. De plus il est offert la possibilité d'ajouter vos propres catégories.  
Cette extension vise à offrir une expérience de gestion des favoris plus fluide et plus intuitive tout en préservant la vie privée de l'utilisateur.

## CHROME EXTENSIONS SETTINGS
1. Activer mode développeur
2. Repérer le bouton "Charger l'extension non empaquetée"  

![Chrome extension settings](https://github.com/EmmanuelLefevre/MarkdownImg/blob/main/chrome_settings.png)  

3. Ouvrir l'URL ci dessous dans le navigateur Chrome
```bash
chrome://extensions/
```
4. Vérifier les permissions d'extension Chrome
```bash
chrome://settings/content/notifications
```
5. Ajouter/Bloquer permission de notifications
```bash
chrome-extension://<id>
```
```bash
chrome-extension://mphajpdnlknfhohmjkdkljjjkgdfello
```
![Chrome extension id](https://github.com/EmmanuelLefevre/MarkdownImg/blob/main/chrome_extension_id.png)  

6. Accéder aux requêtes réseau du service worker

![Chrome extension requête](https://github.com/EmmanuelLefevre/MarkdownImg/blob/main/chrome_extension_requête.png)  

## API
### Installer Python
[Télécharger Python 3.13.1](https://www.python.org/downloads/)  

- Checker l'installation de Python
```bash
python --version
```
- Checker l'installation de Pip
```bash
pip --version
```

### Installer Ollama
[Télécharger Ollama](https://ollama.com/download)  

- Checker l'installation de Ollama
```bash
ollama --version
```
### Requirements
- Flask
- Beautifulsoup4
- Requests

### Procedure
1. Installer les librairies (se placer dans le répertoire /api)
```bash
pip install -r requirements.txt
```
2. Changer le path du DATAMODEL dans classify_url.py (ligne 9).
3. Lancer l'application python
```bash
python api/app.py
```
4. Lancer une instance ollama
```bash
ollama serve
```
5. Faire une requète à partir d'une url (ex. https://www.youtube.com)
```bash
curl -X POST http://127.0.0.1:5000/fetch-data -H "Content-Type: application/json" -d '{"url": "https://www.youtube.com"}'
```

## SERVEO CONFIGURATION
Serveo.net est un service de tunneling SSH qui permet de rendre vos applications locales accessibles sur Internet sans avoir à configurer un serveur ou à manipuler des paramètres complexes de réseau. Il vous suffit de disposer d'une connexion SSH et d'un terminal pour créer un tunnel sécurisé vers votre machine locale.  
Serveo est particulièrement utile pour les développeurs qui souhaitent tester des applications web localement (tout en permettant l'accès à des utilisateurs externes) sans nécessiter de configuration complexe de pare-feu ou de routeurs. Il se distingue par sa simplicité d'utilisation, ne nécessitant aucune installation de logiciel supplémentaire.  

[Serveo documentation](https://serveo.net/)

### Configurer le tunneling SSH
Créer un index.html

Dans le dossier courant du projet
```bash
py -m http.server <PORT>
```
```bash
ssh -R 80:localhost:<PORT> serveo.net
```
```bash
ssh -R sortify.com:80:localhost:<PORT> serveo.net
```
Créer paire de clés RSA 4096 bits
```powershell
ssh-keygen -t rsa -b 4096 -f "$env:USERPROFILE\.ssh\serveo"
```
Ou ED25519 256 bits
```powershell
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\serveo_ed25519"
```
Ou ECDSA 521 bits
```powershell
ssh-keygen -t ecdsa -b 521 -f "$env:USERPROFILE\.ssh\serveo_ecdsa"
```
Se logger dans serveo avec son compte Github

## LIENS UTILES
[Chrome extension documentation](https://developer.chrome.com/docs/extensions/reference?hl=fr)  
[Manifest documentation](https://developer.chrome.com/docs/extensions/reference/manifest?hl=fr)  
[Chrome permission](https://developer.chrome.com/docs/extensions/reference/api/permissions?hl=fr)
