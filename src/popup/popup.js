// Chargement de l'extension
document.addEventListener("DOMContentLoaded", () => {
  const button  = document.getElementById("enable-notifs");

  button .addEventListener("click", () => {
    if (Notification.permission === "granted") {
      console.log("Autorisation pour les notifications déjà activée.");
    }
    else if (Notification.permission === "denied") {
      alert("Veuillez activer les notifications dans les paramètres du navigateur!");
    }
    else {
      // L'état est "default", demander la permission
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Autorisation pour les notifications activée.");
        }
        else {
          console.log("Autorisation pour les notifications refusée.");
        }
      });
    }
  });
});


// Sort button click
document.getElementById("sort-btn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "sortBookmarks" }, (response) => {
    if (response.success) {
      console.log("Favoris triés avec succès !");
    }
  });
});
