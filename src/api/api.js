// ################################## //
// ########## Add bookmark ########## //
// ################################## //
// Code 200
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {

  if (request.action === 'sendActiveTabUrl') {
    // Utiliser chrome.windows.getCurrent pour obtenir la fenêtre active
    chrome.windows.getCurrent({ populate: true }, function(window) {
      // Trouver l'onglet actif dans la fenêtre
      const activeTab = window.tabs.find(tab => tab.active);

      if (!activeTab || !activeTab.url) {
        console.error('Active tab or URL not available!');
        sendResponse({ success: false, error: 'url' });
        return;
      }

      console.log('URL of active tab:', activeTab.url);

      // Envoyer l'URL au back-end
      fetch('https://sortify/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: activeTab.url })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Back-end success response:', data);
        sendResponse({ success: true, data });
      })
      .catch(error => {
        if (error.message.includes('NetworkError')) {
          sendResponse({ success: false, error: 'offline' });
        }
        else {
          sendResponse({ success: false, error: error.message });
        }
      });
    });

    // Réponse asynchrone
    return true;
  }
});

// ################################## //
// ########## Get category ########## //
// ################################## //
// Code 200


// ################################## //
// ########## Add category ########## //
// ################################## //
// Code 201


// #################################### //
// ########## Patch category ########## //
// #################################### //
// Code 200
