// Fonction pour créer une notification desktop personnalisée en fonction du type
const createNotification = (type) => {
  let message;
  let body;
  let icon;

  // Utilisation d'un switch pour déterminer le type de notification
  switch (type) {
    case 'success':
      message = 'Sortify';
      body = '🚀 Les notifications sont activées!';
      icon = '../assets/logo/logo.png';
      break;
    case 'error':
      message = 'Sortify';
      body = '⚠️ Erreur lors de la demande des permissions!';
      icon = '../assets/logo/logo.png';
      break;
    case 'info':
      message = 'Sortify';
      body = 'ℹ️ Notifications en cours de vérification...';
      icon = '../assets/logo/logo.png';
      break;
  }

  // Vérifier si les notifications sont supportées par le navigateur avant de les créer
  if ("Notification" in window) {
    new Notification(message, {
      body: body,
      icon: icon,
      silent: true,
      badge: 'src/assets/icons/success_48.png'
    });
  }
  else {
    setTimeout(() => alert("💀💀💀 Les notifications ne sont pas supportées par ce navigateur!"), 2000);
  }
};

// Fonction pour mettre à jour l'état du bouton de notifications
const updateButtonVisibility = (button, shouldShow) => {
  button.style.display = shouldShow ? 'block' : 'none';
};

// Fonction pour gérer l'état initial des permissions notifications et de son bouton
const initializeNotificationPermissions = (enableNotifsButton) => {
  Notification.permission === "granted"
    ? (createNotification('success'), updateButtonVisibility(enableNotifsButton, false))
    : updateButtonVisibility(enableNotifsButton, true);
};

// Fonction pour gérer les clics sur le bouton de notifications
const handleNotificationButtonClick = (enableNotifsButton) => {
  enableNotifsButton.addEventListener('click', async (_event) => {
    try {
      // Ouvrir l'onglet des paramètres de notifications de Chrome
      chrome.tabs.create({ url: 'chrome://settings/content/notifications' });

      // Vérifier si l'autorisation a changé
      const checkPermission = setInterval(() => {
        if (Notification.permission === 'granted') {
          clearInterval(checkPermission);
          createNotification('success');
          updateButtonVisibility(enableNotifsButton, false);
        }
      }, 1000);
    }
    catch (err) {
      console.error("Erreur: ", err);
      createNotification('error');
    }
  });
};

// Fonction pour afficher une alerte selon l'état des permissions
const showAlertForPermission = () => {
  switch (Notification.permission) {
    case "default":
      setTimeout(() => alert("Activer vos notifications svp 👉👉👉"), 2000);
      break;
    case "denied":
      setTimeout(() => alert("🤬🤬🤬 Notifications refusées! 🤬🤬🤬"), 2000);
      break;
  }
};

// CHARGEMENT DU DOM
document.addEventListener('DOMContentLoaded', () => {
  const enableNotifsButton = document.getElementById("enable-notifs");

  // Initialiser l'état des permissions
  initializeNotificationPermissions(enableNotifsButton);

  // Gérer les clics sur le bouton des permissions de notifications
  handleNotificationButtonClick(enableNotifsButton);

  // Afficher une alerte selon l'état actuel des permissions
  showAlertForPermission();
});
