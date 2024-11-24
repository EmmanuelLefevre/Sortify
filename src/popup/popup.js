// Chargement de l'extension
document.addEventListener('DOMContentLoaded', () => {
  const enableNotifsButton = document.getElementById("enable-notifs");

  // Fonction pour mettre à jour l'état du bouton
  const updateButtonVisibility = (shouldShow) => {
    enableNotifsButton.style.display = shouldShow ? 'block' : 'none';
  };

  // Vérifer si le navigateur prend en charge les notifications
  if (!("Notification" in window)) {
    alert("Ce navigateur ne prend pas en charge les notifications de bureau!");
  }

  // Gérer les différents états des permissions
  switch (Notification.permission) {
    case "granted":
      updateButtonVisibility(false);
      new Notification('Test', {
        body: '🚀🚀🚀 Notifications déjà activées! 🚀🚀🚀'
      });
      break;

    // Si la permission n'est pas encore déterminée, demander à l'utilisateur
    case "default":
      Notification.requestPermission().then((permission) => {
        updateButtonVisibility(permission === "denied");
        if (permission === "granted") {
          new Notification('Test', {
            body: '🚀🚀🚀 Notifications activées! 🚀🚀🚀'
          });
        }
        else {
          new Notification('Test', {
            body: '🤬🤬🤬 Notifications refusées! 🤬🤬🤬'
          });
        }
      }).catch((err) => {
        console.error("Erreur lors de la demande des permissions : ", err);
        new Notification('Test', {
          body: '⚠️ Erreur lors de la demande des permissions! ⚠️'
        });
      });
      break;

    // Afficher le bouton si les notifications sont refusées
    case "denied":
      updateButtonVisibility(true);
      break;
  }
});


document.getElementById('sort-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "sortBookmarks" }, (response) => {
    if (response.success) {
      console.log("Favoris triés avec succès !");
    }
  });
});
