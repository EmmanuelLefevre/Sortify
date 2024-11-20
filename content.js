// Interagit avec les pages web en modifiant le DOM ou en récupérant des données.

// Le fichier content.js est un script de contenu qui est injecté directement dans les pages web que vous définissez dans le manifest.json. Ce script s'exécute dans le contexte de la page web elle-même, ce qui lui permet d'interagir avec le contenu de la page HTML et de manipuler le DOM de la page.

// Rôle :
// Il permet à l'extension de manipuler les pages web que l'utilisateur visite.
// Par exemple, vous pourriez l'utiliser pour extraire des informations d'une page web ou ajouter des fonctionnalités spécifiques à cette page (comme un bouton pour trier ou filtrer du contenu).
// Il peut également interagir avec d'autres parties de l'extension, en envoyant des messages vers le background.js ou le popup.js.

// Exemple d'injection d'un bouton dans la page
let button = document.createElement('button');
button.textContent = 'Trier mes favoris';
document.body.appendChild(button);

// Ajouter un événement à ce bouton
button.addEventListener('click', function() {
  alert('Fonction de tri des favoris appelée!');
});
