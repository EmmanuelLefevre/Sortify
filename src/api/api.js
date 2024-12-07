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

// ######################################### //
// ########## Fonction utilitaire ########## //
// ######################################### //
function handleApiError(error, sendResponse) {
  console.error('Error occurred:', error);

  // Gérer erreur en fonction du type
  if (error.message.includes('NetworkError')) {
    sendResponse({ success: false, error: 'offline' });
  }
  else {
    sendResponse({ success: false, error: error.message });
  }
}





// ################################## //
// ########## Add bookmark ########## //
// ################################## //
// chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {

//   if (request.action === 'sendActiveTabUrl') {
//     // Utiliser chrome.windows.getCurrent pour obtenir la fenêtre active
//     chrome.windows.getCurrent({ populate: true }, function(window) {
//       // Trouver l'onglet actif dans la fenêtre
//       const activeTab = window.tabs.find(tab => tab.active);

//       if (!activeTab || !activeTab.url) {
//         console.error('Active tab or URL not available!');
//         sendResponse({ success: false, error: 'url' });
//         return;
//       }

//       console.log('URL of active tab:', activeTab.url);

//       // Envoyer l'URL au back-end
//       fetch(`${apiBaseUrl}bookmark`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ url: activeTab.url })
//       })
//       .then(response => response.json())
//       .then(data => {
//         console.log('Back-end success response:', data);
//         sendResponse({ success: true, data });
//       })
//       .catch(error => {
//         if (error.message.includes('NetworkError')) {
//           sendResponse({ success: false, error: 'offline' });
//         }
//         else {
//           sendResponse({ success: false, error: error.message });
//         }
//       });
//     });

//     // Dans une extension Chrome, lorsqu'une réponse doit être envoyée de manière asynchrone, il est nécessaire de retourner true depuis l'écouteur pour indiquer que la réponse sera différée.
//     return true;
//   }
// });

// #################################### //
// ########## Get categories ########## //
// #################################### //
// export async function loadCategories() {
//   try {
//     const response = await fetch(`${apiBaseUrl}categories`);

//     if (!response.ok) {
//       throw new Error(`Erreur HTTP : ${response.status}`);
//     }

//     const result = await response.json();
//     return result;
//   }
//   catch (error) {
//     console.error("Erreur dans loadCategories :", error);
//     // Transmettre erreur à popup.js
//     throw error;
//   }
// }

// ################################## //
// ########## Add category ########## //
// ################################## //
// export async function addCategory(categoryName) {
//   const payload = { name: categoryName };

//   try {
//     const response = await fetch(`${apiBaseUrl}category`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       throw new Error(`Erreur HTTP : ${response.status}`);
//     }

//     const result = await response.json();
//     return result;
//   }
//   catch (error) {
//     console.error("Erreur dans addCategory :", error);
//     // Transmettre erreur à popup.js
//     throw error;
//   }
// };

// ##################################### //
// ########## Update category ########## //
// ########################################## //
// export async function updateCategory(oldCategoryId, newCategoryName) {
//   const payload = { oldCategoryId, newCategoryName };

//   try {
//     const response = await fetch(`${apiBaseUrl}category/${oldCategoryId}`, {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       throw new Error(`Erreur HTTP : ${response.status}`);
//     }

//     const result = await response.json();
//     return result;
//   }
//   catch (error) {
//     console.error("Erreur dans updateCategory :", error);
//     // Transmettre erreur à popup.js
//     throw error;
//   }
// }