// ########## Fonctions pour gérer le local storage Sortify (JSON) ########## //
// Setter
const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
// Getter avec fallback en cas de données invalides
const getLocalStorage = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }
  catch (error) {
    console.error(`Erreur lors de la récupération de "${key}" depuis le localStorage:`, error);
    // Retourner null en cas de données corrompues
    return null;
  }
};
// Initialiser le local storage
const initializeSortifyLocalStorage = () => {
  const defaultNotificationPermission = { notif: false };
  const sortifyLocalStorage = getLocalStorage("Sortify");

  if (!sortifyLocalStorage) {
    setLocalStorage("Sortify", defaultNotificationPermission);
    return defaultNotificationPermission;
  }
  return sortifyLocalStorage;
};
// Mettre à jour l'état des notifications dans le local storage
const updateNotificationStatus = (status) => {
  const sortifyLocalStorage = getLocalStorage("Sortify");

  if (sortifyLocalStorage) {
    // Mise à jour de l'état des notifications (true ou false)
    sortifyLocalStorage.notif = status;
    setLocalStorage("Sortify", sortifyLocalStorage);

    // Créer notification uniquement lorsque les notifications sont activées
    if (status) {
      createNotification('success');
    }
  }
  else {
    console.error("Impossible de mettre à jour l'état des notifications: localStorage invalide.");
  }
};

// ########## Fonction pour gérer les alertes personnalisées ########## //
const showAlert = (message, timeout = 1000) => {
  setTimeout(() => alert(message), timeout);
};

// ########## Fonction pour créer une notification desktop personnalisée en fonction du type ########## //
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
      body = '⚠️ Une erreur est survenue!';
      icon = '../assets/logo/logo.png';
      break;
    case 'info':
      message = 'Sortify';
      body = 'ℹ️ Informations string...';
      icon = '../assets/logo/logo.png';
      break;
    default:
      console.warn(`Type de notification inconnu: "${type}".`);
      // Quitter si le type est invalide
      return;
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
    showAlert("💀💀💀 Les notifications ne sont pas supportées par ce navigateur!");
  }
};

// ########## Fonction pour mettre à jour l'état du bouton de notifications ########## //
const updateButtonVisibility = (button, shouldShow) => {
  button.style.display = shouldShow ? 'block' : 'none';
};

// ########## Fonction pour gérer l'état initial des permissions notifications et de son bouton ########## //
const initializeNotificationPermissions = (enableNotifsButton) => {
  // Récupérer ou initialiser le cookie
  const sortifyLocalStorage = initializeSortifyLocalStorage();

  // Gestion des permissions via un switch
  switch (Notification.permission) {
    // Masquer le bouton si permission accordée
    case "granted":
      if (!sortifyLocalStorage.notif) {
        updateNotificationStatus(true);
      }
      updateButtonVisibility(enableNotifsButton, false);
      break;

    // Afficher le bouton si état "denied" + alert
    case "denied":
      updateButtonVisibility(enableNotifsButton, true);
      updateNotificationStatus(false);
      showAlert("🤬🤬🤬 Notifications refusées! 🤬🤬🤬");
      break;

    // Afficher le bouton si état "default" + alert
    case "default":
      updateButtonVisibility(enableNotifsButton, true);
      updateNotificationStatus(false);
      showAlert("Activer vos notifications svp 👉👉👉");
      break;

    // Cas d'erreur
    default:
      updateButtonVisibility(enableNotifsButton, true);
      updateNotificationStatus(false);
      showAlert("⚠️ Une erreur est survenue!");
      break;
  }
};

// ########## Fonction pour gérer les clics sur le bouton de notifications ########## //
const handleNotificationButtonClick = (enableNotifsButton) => {
  enableNotifsButton.addEventListener('click', async (_event) => {
    try {
      // Ouvrir l'onglet des paramètres de notifications de Chrome
      chrome.tabs.create({ url: 'chrome://settings/content/notifications' });

      // Vérifier si l'autorisation a changé
      const checkPermission = setInterval(() => {
        if (Notification.permission === 'granted') {
          clearInterval(checkPermission);
          updateNotificationStatus(true);
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

// ########## Chargement du DOM ########## //
document.addEventListener('DOMContentLoaded', () => {
  const enableNotifsButton = document.getElementById("enable-notifs");
  if (!enableNotifsButton) {
    console.error("Le bouton de notifications est introuvable dans le DOM.");
    return;
  }

  // Initialiser l'état des permissions
  initializeNotificationPermissions(enableNotifsButton);

  // Gérer les clics sur le bouton des permissions de notifications
  handleNotificationButtonClick(enableNotifsButton);
});
