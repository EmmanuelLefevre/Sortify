# SORTIFY

## SOMMAIRE
- [INTRODUCTION](#introduction)
- [CHROME EXTENSIONS SETTINGS](#chrome-extensions-settings)
- [SERVEO CONFIGURATION](#serveo-configuration)

## INTRODUCTION
La gestion des favoris dans un navigateur peut devenir complexe à mesure que le nombre de liens enregistrés augmente. Afin de simplifier cette organisation Sortify utilise un Large Language Model (LLM) pour automatiser et optimiser le tri des favoris dans Chrome.  
Grâce à l'intégration de l'intelligence artificielle, cette extension ne se contente pas de trier vos favoris de manière basique par ordre alphabétique ou URL, mais elle analyse également vos liens pour les regrouper en catégories intelligentes. Que vous ayez des favoris liés à la technologie, à l'éducation ou au divertissement l'extension suggère automatiquement les meilleures catégories pour mieux organiser vos liens.  
Cette extension vise à offrir une expérience de gestion des favoris plus fluide et plus intuitive tout en préservant la vie privée de l'utilisateur.

## CHROME EXTENSIONS SETTINGS
1. Ouvrir l'URL ci dessous dans le navigateur Chrome
```bash
chrome://extensions/
```
2. Activer mode développeur
3. Repérer le bouton "Charger l'extension non empaquetée"


![Chrome extension settings](https://github.com/EmmanuelLefevre/Settings/blob/main/MarkdownImg/chrome_settings.png)

## 


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
