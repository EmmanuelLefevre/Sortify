// ########## Utilitaires pour le local storage Sortify (JSON) ########## //
// Setter
const setLocalStorage = (key, value) => {
  if (localStorage) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  else {
    console.warn("Local storage inaccessible!");
  }
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


// ########## Initialiser les JSON du local storage ########## //
// Initialiser les données des notifications
const initializeNotificationsStorage = () => {
  const defaultNotificationPermission = { notifications: false };
  const notifData = getLocalStorage("SortifyNotifications");

  if (!notifData) {
    setLocalStorage("SortifyNotifications", defaultNotificationPermission);
    return defaultNotificationPermission;
  }
  return notifData;
};
// Initialiser les données des alertes
const initializeAlertStorage = () => {
  const defaultAlertSettings = {
    denied_notifications: true,
    default_notifications: true,
    unsupported_notifications: true
  };
  const alertData = getLocalStorage("SortifyAlerts");

  if (!alertData) {
    setLocalStorage("SortifyAlerts", defaultAlertSettings);
    return defaultAlertSettings;
  }
  return alertData;
};


// ########## Gestion des alertes ########## //
// Afficher une alerte personnalisée si elle n'a pas déjà été affichée
const showAlert = (key, message, timeout = 2000) => {
  // Récupérer l'état des alertes depuis le localStorage ou initialiser un objet vide en guise de fallback si données inexistantes
  const alertStatus = getLocalStorage("SortifyAlerts") || {};

  // Vérifier si l'alerte a déjà été affichée
  if (!alertStatus[key]) return;

  // Afficher l'alerte après le délai spécifié
  setTimeout(() => alert(message), timeout);

  // Désactiver l'alerte après l'affichage
  alertStatus[key] = false;
  setLocalStorage("SortifyAlerts", alertStatus);
};
// Réactiver une alerte spécifique
const resetAlertStatus = (key) => {
  const alertStatus = getLocalStorage("SortifyAlerts") || {};
  alertStatus[key] = true;
  setLocalStorage("SortifyAlerts", alertStatus);
};


// ########## Gérer la mise à jour de l'état des notifications ########## //
const updateNotificationStatus = (status) => {
  const notifData = getLocalStorage("SortifyNotifications");

  if (notifData) {
    // Mise à jour de l'état des notifications (true ou false)
    notifData.notif = status;
    setLocalStorage("SortifyNotifications", notifData);

    // Créer notification uniquement lorsque les notifications sont activées
    if (status) {
      createNotification('success');
    }
    else {
      resetAlertStatus("denied_notifications");
    }
  }
  else {
    console.error("Impossible de mettre à jour l'état des notifications: localStorage invalide.");
  }
};


// ########## Créer notifications desktop personnalisées en fonction du type ########## //
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
    case 'chrome':
      message = 'Sortify';
      body = '🛜 API Chrome non disponible!';
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
    showAlert("unsupported_notifications", "💀💀💀 Les notifications ne sont pas supportées par ce navigateur!");
  }
};

// ########## Initialiser les permissions et gérer l'état du bouton de notifications ########## //
const updateButtonVisibility = (button, shouldShow) => {
  button.style.display = shouldShow ? 'flex' : 'none';
};

// ########## Fonction pour gérer l'état initial des permissions notifications et de son bouton ########## //
const initializeNotificationPermissions = (enableNotifsButton) => {
  // Initialiser ou récupérer SortifyNotifications à partir du localStorage
  const notificationsLocalStorage = initializeNotificationsStorage();
  // Initialiser ou récupérer SortifyAlerts à partir du localStorage
  initializeAlertStorage();

  // Gestion des permissions
  switch (Notification.permission) {
    // Masquer le bouton si permission accordée
    case "granted":
      if (!notificationsLocalStorage.notif) {
        updateNotificationStatus(true);
      }
      updateButtonVisibility(enableNotifsButton, false);
      break;

    // Afficher le bouton si état "denied" + alert
    case "denied":
      updateButtonVisibility(enableNotifsButton, true);
      updateNotificationStatus(false);
      showAlert("denied_notifications", "🤬🤬🤬 Notifications refusées! 🤬🤬🤬");
      break;

    // Afficher le bouton si état "default" + alert
    case "default":
      updateButtonVisibility(enableNotifsButton, true);
      updateNotificationStatus(false);
      showAlert("default_notifications", "Activer vos notifications svp 👉👉👉");
      break;

    // Cas d'erreur
    default:
      updateButtonVisibility(enableNotifsButton, true);
      updateNotificationStatus(false);
      if ("Notification" in window && Notification.permission === "granted") {
        createNotification('error');
      }
      else {
        showAlert("⚠️ Une erreur est survenue!");
      }
      break;
  }
};

// ########## Fonction pour gérer les clics sur le bouton de notifications ########## //
const handleNotificationButtonClick = (enableNotifsButton) => {
  enableNotifsButton.addEventListener('click', async (_event) => {
    try {
      // Vérifier si l'API chrome.tabs.create est disponible
      if (chrome.tabs && chrome.tabs.create) {
        // Ouvrir l'onglet des paramètres de notifications de Chrome
        chrome.tabs.create({ url: 'chrome://settings/content/notifications' });
      }
      else {
        console.warn("API chrome.tabs non supportée!");
        createNotification('chrome');
        return;
      }

      // Vérifier si l'autorisation a changée
      const checkPermission = setInterval(() => {
        if (Notification.permission === 'granted') {
          clearInterval(checkPermission);
          updateNotificationStatus(true);
          updateButtonVisibility(enableNotifsButton, false);
        }
      }, 1000);

      // Arrêter la vérification après 15 secondes si la permission n'est pas accordée
      setTimeout(() => clearInterval(checkPermission), 15000);
    }
    catch (err) {
      console.error("Erreur: ", err);
      createNotification('error');
    }
  });
};

// ########## Ajouter animation sur le bouton "Ajouter" ########## //
const addAnimationClass = () => {
  const button = document.getElementById("add-bookmarks-btn");
  if (button) {
    // Ajouter la classe d'animation
    button.classList.add("lightSpeedInLeft");
  }
  else {
    console.warn("Le bouton avec l'ID 'add-bookmarks-btn' n'a pas été trouvé dans le DOM.");
  }
};

// ########## Gérer état bordure de l'input en fonction de la validité saisie utilisateur ########## //
const input = document.getElementById('category-input');
const span = document.getElementById('border-input');

input.addEventListener('input', () => {
  if (input.validity.valid) {
    input.classList.add('valid');
    input.classList.remove('invalid');
    input.classList.remove('headshake');
  }
  else {
    input.classList.add('invalid');
    input.classList.add('headshake');
    input.classList.remove('valid');
  }
});

// ########## Chargement du DOM ########## //
document.addEventListener('DOMContentLoaded', () => {
  addAnimationClass();

  const enableNotifsButton = document.getElementById("notifs-content");
  if (!enableNotifsButton) {
    console.warn("Le bouton de notifications est introuvable dans le DOM.");
    return;
  }

  // Initialiser l'état des permissions
  initializeNotificationPermissions(enableNotifsButton);

  // Gérer les clics sur le bouton des permissions de notifications
  handleNotificationButtonClick(enableNotifsButton);
});
