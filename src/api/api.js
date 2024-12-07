/*
 * Copyright (c) Novembre 2024
 * LEFEVRE Emmanuel
 * Cod!ngT3kSolutions, SIRET: 50863331000026
 * Tous droits réservés.
 *
 * Licence propriétaire Sortify. Aucun droit n'est accordé en dehors des conditions spécifiées dans la présente licence.
 * Pour plus de détails, consultez le fichier LICENSE.md
*/

// ############################### //
// ########## Constante ########## //
// ############################### //
const apiBaseUrl = 'https://sortify/api/';

// ################################## //
// ########## Add bookmark ########## //
// ################################## //
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'sendActiveTabUrl') {
    (async () => {
      try {
        // Utiliser chrome.windows.getCurrent pour obtenir la fenêtre active
        chrome.windows.getCurrent({ populate: true }, async function(window) {
          // Trouver l'onglet actif dans la fenêtre
          const activeTab = window.tabs.find(tab => tab.active);

          if (!activeTab || !activeTab.url) {
            console.error('Active tab or URL not available!');
            sendResponse({ success: false, error: 'url' });
            return;
          }

          console.log('URL of active tab:', activeTab.url);

          // Requête pour ajouter le favori
          const response = await fetch(`${apiBaseUrl}bookmark`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: activeTab.url }),
          });

          const result = await response.json();
          console.log('Bookmark added:', result);

          // Retourner les données au popup.js
          sendResponse({ success: true, data: result });
        });
      }
      catch (error) {
        handleApiError(error, sendResponse);
      }
    // L'API Chrome, comme chrome.windows.getCurrent ne retourne pas de promesses. Par conséquent, on ne peut pas directement utiliser await sur ces fonctions. Il convient donc d'auto-invoquer cette fonction pour l'exécuter immédiatement.
    })();

    // Dans une extension Chrome, lorsqu'une réponse doit être envoyée de manière asynchrone, il est nécessaire de retourner true depuis l'écouteur pour indiquer que la réponse sera différée.
    return true;
  }
});

// #################################### //
// ########## Get categories ########## //
// #################################### //
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'loadCategories') {
    (async () => {
      try {
        const response = await fetch(`${apiBaseUrl}categories`);

        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const result = await response.json();
        console.log('Categories loaded:', result);

        sendResponse({ success: true, data: result });
      }
      catch (error) {
        handleApiError(error, sendResponse);
      }
    })();

    return true;
  }
});

// ################################## //
// ########## Add category ########## //
// ################################## //
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'addCategory') {
    (async () => {
      const { categoryName } = request;
      const payload = { name: categoryName };

      try {
        const response = await fetch(`${apiBaseUrl}category`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const result = await response.json();
        console.log('Category added:', result);

        sendResponse({ success: true, data: result });
      }
      catch (error) {
        handleApiError(error, sendResponse);
      }
    })();

    return true;
  }
});

// ##################################### //
// ########## Update category ########## //
// ##################################### //
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'updateCategory') {
    (async () => {
      const { oldCategoryId, newCategoryName } = request;
      const payload = { oldCategoryId, newCategoryName };

      try {
        const response = await fetch(`${apiBaseUrl}category/${oldCategoryId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const result = await response.json();
        console.log('Category updated:', result);

        sendResponse({ success: true, data: result });
      }
      catch (error) {
        handleApiError(error, sendResponse);
      }
    })();

    return true;
  }
});

// ########################################### //
// ########## Fonctions utilitaires ########## //
// ########################################### //
function handleApiError(error, sendResponse) {
  console.error('Error occurred:', error);

  // Gérer erreur en fonction du type
  if (error.message.includes('NetworkError')) {
    sendResponse({ success: false, error: 'offline' });
  }
  // Gérer erreur HTTP spécifique
  else if (error.message.includes('Erreur HTTP')) {
    sendResponse({ success: false, error: 'server-error' });
  }
  // Gérer autres erreurs
  else {
    sendResponse({ success: false, error: error.message });
  }
}
