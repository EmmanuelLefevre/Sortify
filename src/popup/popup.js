// Gère la logique JavaScript pour l'interface utilisateur du popup.

document.getElementById("sort-btn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "sortBookmarks" }, (response) => {
    if (response.success) {
      alert("Favoris triés avec succès !");
    }
  });
});