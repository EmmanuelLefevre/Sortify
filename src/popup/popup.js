// Fonction pour créer une notification personnalisée en fonction du type
const createNotification = (type) => {
  let message;
  let body;
  let icon;

  // Utilisation d'un switch pour déterminer le type de notification
  switch (type) {
    case 'success':
      message = 'Notifications activées';
      body = '🚀🚀🚀 Notifications activées! 🚀🚀🚀';
      icon = 'src/assets/icons/success_icon.png';
      break;
    case 'already_success':
      message = 'Notifications déjà activées';
      body = '🚀🚀🚀 Notifications déjà activées! 🚀🚀🚀';
      icon = 'src/assets/icons/success_icon.png';
      break;
    case 'denied':
      message = 'Notification refusée';
      body = '🤬🤬🤬 Notifications refusées! 🤬🤬🤬';
      icon = 'src/assets/icons/denied_icon.png';
      break;
    case 'error':
      message = 'Erreur';
      body = '⚠️ Erreur lors de la demande des permissions! ⚠️';
      icon = 'src/assets/icons/error_icon.png';
      break;
    case 'info':
      message = 'Information';
      body = 'ℹ️ Notifications en cours de vérification... ℹ';
      icon = 'src/assets/icons/info_icon.png';
      break;
    default:
      message = 'Notification par défaut';
      body = '🔔 Vous avez une nouvelle notification! 🔔';
      icon = 'src/assets/icons/default_icon.png';
      break;
  }

  // Créer la notification
  new Notification(message, {
    body: body,
    icon: icon
  });
};

// Fonction pour mettre à jour l'état du bouton de notifications
const updateButtonVisibility = (button, shouldShow) => {
  button.style.display = shouldShow ? 'block' : 'none';
};

// Fonction pour gérer l'état des permissions notifications et de son bouton
const handleNotificationPermissions = (enableNotifsButton) => {
  switch (Notification.permission) {
    // Masquer le bouton si les notifications sont déjà acceptées
    case "granted":
      updateButtonVisibility(enableNotifsButton, false);
      createNotification('already_success');
      break;

    // Si la permission n'est pas encore déterminée, demander à l'utilisateur
    case "default":
      Notification.requestPermission().then((permission) => {
        updateButtonVisibility(enableNotifsButton, permission === "denied");
        if (permission === "granted") {
          createNotification('success');
        }
        else {
          createNotification('denied');
        }
      }).catch((err) => {
        console.error("Erreur lors de la demande des permissions : ", err);
        createNotification('error');
      });
      break;

    // Afficher le bouton si les notifications sont refusées
    case "denied":
      updateButtonVisibility(enableNotifsButton, true);
      enableNotifsButton.addEventListener('click', () => {
        // Demander la permission de notifications lors du clic
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            createNotification('success');
            updateButtonVisibility(enableNotifsButton, false);
          }
          else {
            createNotification('denied');
          }
        }).catch((err) => {
          console.error("Erreur lors de la demande des permissions : ", err);
          createNotification('error');
        });
      });
    break;
  }
};

// Chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  const enableNotifsButton = document.getElementById("enable-notifs");

  // Appeler la gestion des permissions de notifications
  handleNotificationPermissions(enableNotifsButton);
});


document.getElementById('sort-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "sortBookmarks" }, (response) => {
    if (response.success) {
      console.log("Favoris triés avec succès !");
    }
  });
});
