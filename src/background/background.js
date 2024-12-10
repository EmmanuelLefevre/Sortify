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
const apiBaseUrl = 'http://localhost:11434/api/';

// ################################## //
// ########## Add bookmark ########## //
// ################################## //
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  // console.log('Add bookmark in background.js:', request);
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

          // console.log('URL of active tab: ', activeTab.url);

          // Requête pour ajouter le favori
          const response = await fetch(`${apiBaseUrl}bookmark`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: activeTab.url }),
          });

          // Vérifier si réponse OK, sinon passer l'erreur à handleApiError()
          if (!response.ok) {
            handleApiError({ message: `Erreur HTTP: ${response.status}`, response }, sendResponse);
            return;
          }

          const result = await response.json();
          // console.log('Bookmark added: ', result);

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
  // console.log('Get categories in background.js:', request);
  if (request.action === 'loadCategories') {
    (async () => {
      try {
        const response = await fetch(`${apiBaseUrl}categories`);

        if (!response.ok) {
          handleApiError({ message: `Erreur HTTP: ${response.status}`, response }, sendResponse);
          return;
        }

        const result = await response.json();
        // console.log('Categories loaded: ', result);

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
  // console.log('Add category in background.js:', request);
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
          handleApiError({ message: `Erreur HTTP: ${response.status}`, response }, sendResponse);
          return;
        }

        const result = await response.json();
        // console.log('Category added: ', result);

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
  // console.log('Update category in background.js:', request);
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
          handleApiError({ message: `Erreur HTTP: ${response.status}`, response }, sendResponse);
          return;
        }

        const result = await response.json();
        // console.log('Category updated: ', result);

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
  // console.error('Error occurred: ', error);
  if (error.response) {
    const status = error.response.status;

    // Erreurs HTTP
    switch (true) {
      case status >= 500 && status <= 599:
        sendResponse({ success: false, error: 'server-error' });
        break;

      case status === 404:
        sendResponse({ success: false, error: 'not-found' });
        break;

      case status >= 400 && status <= 499:
        sendResponse({ success: false, error: 'client-error' });
        break;

      default:
        sendResponse({ success: false, error: 'unexpected-http-error' });
        break;
    }
  }
  // Erreurs réseau
  else if (error.message.includes('Failed to fetch')) {
    switch (true) {
      case error.message.includes('net::ERR_NAME_NOT_RESOLVED'):
        sendResponse({ success: false, error: 'dns-error' });
        break;

      case error.message.includes('net::ERR_CONNECTION_REFUSED'):
        sendResponse({ success: false, error: 'forbidden' });
        break;

      case error.message.includes('net::ERR_CONNECTION_TIMED_OUT'):
        sendResponse({ success: false, error: 'offline-server' });
        break;

      default:
        sendResponse({ success: false, error: 'network-error' });
        break;
    }
  }
  // Autres erreurs
  else {
    sendResponse({ success: false, error: 'unexpected-error' });
  }
  // console.log('Response sent to popup.js from handleApiError() in api.js: ', error);
}
