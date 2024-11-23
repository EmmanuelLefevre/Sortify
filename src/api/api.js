console.log('Service worker api.js démarré avec succès!');

// chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
//   if (message.action === "sortBookmarks") {
//     chrome.bookmarks.getTree((bookmarks) => {
//       console.log("Favoris triés", bookmarks);
//       sendResponse({ success: true });
//     });
//     return true; // Indique que la réponse est asynchrone
//   }
// });
