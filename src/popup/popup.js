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
      icon = 'success-icon.png';  // Exemple d'icône pour succès
      break;
    case 'already_success':
      message = 'Notifications déjà activées';
      body = '🚀🚀🚀 Notifications déjà activées! 🚀🚀🚀';
      icon = 'success-icon.png';  // Exemple d'icône pour succès
      break;
    case 'denied':
      message = 'Notification refusée';
      body = '🤬🤬🤬 Notifications refusées! 🤬🤬🤬';
      icon = 'denied-icon.png';   // Exemple d'icône pour refus
      break;
    case 'error':
      message = 'Erreur';
      body = '⚠️ Erreur lors de la demande des permissions! ⚠️';
      icon = 'error-icon.png';    // Exemple d'icône pour erreur
      break;
    case 'info':
      message = 'Information';
      body = 'ℹ️ Notifications en cours de vérification... ℹ️';
      icon = 'info-icon.png';     // Exemple d'icône pour information
      break;
    default:
      message = 'Notification par défaut';
      body = '🔔 Vous avez une nouvelle notification! 🔔';
      icon = 'default-icon.png';  // Icône par défaut
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
      createNotification('denied');
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
