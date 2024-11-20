# SORTIFY

## SOMMAIRE
- [INTRODUCTION](#introduction)
- [SERVEO CONFIGURATION](#serveo-configuration)

## INTRODUCTION
La gestion des favoris dans un navigateur peut devenir complexe à mesure que le nombre de liens enregistrés augmente. Afin de simplifier cette organisation et d'ajouter un aspect intelligent à cette tâche, Sortify utilise un Large Language Model (LLM) pour automatiser et optimiser le tri des favoris dans Chrome.  
Grâce à l'intégration de l'intelligence artificielle, cette extension ne se contente pas de trier vos favoris de manière basique par ordre alphabétique ou URL, mais elle analyse également vos liens pour les regrouper en catégories intelligentes. Que vous ayez des favoris liés à la technologie, à l'éducation ou au divertissement l'extension suggère automatiquement les meilleures catégories pour mieux organiser vos liens.  
Cette extension vise à offrir une expérience de gestion des favoris plus fluide, plus intuitive et plus intelligente tout en préservant la vie privée de l'utilisateur. En combinant l'automatisation avec la puissance des modèles de langage, elle transforme une tâche manuelle en un processus intelligent et rapide.

## SERVEO CONFIGURATION
Serveo.net est un service de tunneling SSH qui permet de rendre vos applications locales accessibles sur Internet sans avoir à configurer un serveur ou à manipuler des paramètres complexes de réseau. Il vous suffit de disposer d'une connexion SSH et d'un terminal pour créer un tunnel sécurisé vers votre machine locale.  
Serveo est particulièrement utile pour les développeurs qui souhaitent tester des applications web localement tout en permettant l'accès à des utilisateurs externes, sans nécessiter de configuration complexe de pare-feu ou de routeurs. Il se distingue par sa simplicité d'utilisation, ne nécessitant aucune installation de logiciel supplémentaire.  

[Serveo documentation](https://serveo.net/)

### Configurer le tunneling SSH
Créer un index.html

Dans le dossier courant du projet
```bash
py -m http.server <PORT>
```
```bash
ssh -R 80:localhost:666 serveo.net
```
```bash
ssh -R sortify.com:80:localhost:666 serveo.net
```
Créer clé SSH et se logger dans serveo avec son compte Github
```bash

```
