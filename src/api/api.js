// Effectue des tâches en arrière-plan (gestion des favoris, appels api, logique principale).

// Le fichier api.js est le script d'arrière-plan de l'extension. Il fonctionne en permanence en arrière-plan, gérant la logique principale de l'extension. C'est là que vous pouvez effectuer des tâches de longue durée, comme des appels réseau, la gestion des favoris, ou d'autres processus qui ne nécessitent pas une interaction immédiate avec l'interface utilisateur.

// Rôle :
// Gère la logique principale de l'extension.
// Peut écouter les événements envoyés par le popup ou le content script et effectuer des actions correspondantes.
// Effectue des tâches de gestion de l'état, comme l'ajout, la suppression ou la modification des favoris, ou envoi de requêtes api vers des serveurs externes.
// Peut aussi gérer des actions dans l'onglet (par exemple, récupérer des données de la page via l'api chrome.tabs).

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sortBookmarks') {
    // Logique pour trier les favoris
    chrome.bookmarks.getTree((bookmarks) => {
      // Logique pour trier les favoris ici
      sendResponse({ success: true });
    });
  }
  return true; // pour indiquer que la réponse est asynchrone
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sortBookmarks") {
    chrome.bookmarks.getTree((bookmarks) => {
      // Implémente la logique de tri des favoris ici
      console.log("Favoris triés", bookmarks);
      sendResponse({ success: true });
    });
    return true; // Indique que la réponse est asynchrone
  }
});

