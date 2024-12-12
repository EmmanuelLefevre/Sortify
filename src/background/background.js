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
const apiBaseUrl = 'http://localhost:5000/api/';

// ################################## //
// ########## Add bookmark ########## //
// ################################## //
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  // console.log('Add bookmark in background.js:', request);
  if (request.action === 'sendActiveTabUrl') {
    (async () => {
      try {
        // Récupérer le User-Agent depuis la requête popup.js
        const userAgent = request.userAgent;

        // Utiliser chrome.tabs.query pour obtenir l'onglet actif dans la fenêtre au premier plan
        chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
          if (tabs.length > 0) {
            // Onglet actif
            const activeTab = tabs[0];

            if (!activeTab || !activeTab.url) {
              sendResponse({ success: false, error: 'url' });
              return;
            }

            // Requête pour ajouter le favori
            const response = await fetch(`${apiBaseUrl}bookmark`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                url: activeTab.url,
                userAgent: userAgent
              }),
            });

            // Vérifier si réponse OK, sinon passer l'erreur à handleApiError()
            if (!response.ok) {
              handleApiError({ message: `Erreur HTTP: ${response.status}`, response }, sendResponse);
              return;
            }

            const result = await response.json();

            // Extraire les valeurs du JSON reçu
            const { label, title } = result;
            if (!label || !title) {
              sendResponse({ success: false, error: 'data' });
              return;
            }

            // Call fonction de création du favori
            handleBookmarkCreation(label, title, activeTab.url, sendResponse);
          }
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
          handleApiError({ message: `Erreur HTTP: ${response.status}`, response }, sendResponse);
          return;
        }

        const result = await response.json();

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
          handleApiError({ message: `Erreur HTTP: ${response.status}`, response }, sendResponse);
          return;
        }

        const result = await response.json();

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
          handleApiError({ message: `Erreur HTTP: ${response.status}`, response }, sendResponse);
          return;
        }

        const result = await response.json();

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
// ########## Fonction pour retourner les cas d'erreurs de l'api à popup.js ########## //
function handleApiError(error, sendResponse) {
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

// ########## Fonction pour créer le dossier de favori ########## //
function handleBookmarkCreation(label, title, url, sendResponse) {
  chrome.bookmarks.search({ title: label }, function(results) {
    // Dossier inexistant
    if (results.length === 0) {
      chrome.bookmarks.create({
        parentId: "1",
        title: label
      }, function(folder) {
        // Erreur lors de la création du dossier
        if (chrome.runtime.lastError) {
          sendResponse({ success: false });
          return;
        }

        chrome.bookmarks.create({
          parentId: folder.id,
          title: title,
          url: url
        }, function(bookmark) {
          // Erreur lors de la création du favori
          if (chrome.runtime.lastError) {
            sendResponse({ success: false });
            return;
          }

          sendResponse({ success: true });
        });
      });
    }
    // Dossier déjà existant
    else {
      chrome.bookmarks.create({
        parentId: results[0].id,
        title: title,
        url: url
      }, function(bookmark) {
        // Erreur lors de la création du favori
        if (chrome.runtime.lastError) {
          sendResponse({ success: false });
          return;
        }

        sendResponse({ success: true });
      });
    }
  });
}