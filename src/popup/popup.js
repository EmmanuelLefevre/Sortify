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
const showAlert = (key, message, timeout = 2000) => {
  // Récupérer l'état des alertes depuis le localStorage ou initialiser un objet vide en guise de fallback si données inexistantes
  const alertStatus = getLocalStorage("SortifyAlerts") || {};

  // Vérifier si l'alerte a déjà été affichée
  if (alertStatus[key]) return;

  // Afficher l'alerte après le délai spécifié
  setTimeout(() => alert(message), timeout);

  // Marquer l'alerte comme affichée
  alertStatus[key] = true;
  setLocalStorage("SortifyAlerts", alertStatus);
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
        console.warn("API chrome.tabs non supportée");
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
  const button = document.getElementById("sort-btn");
  if (button) {
    // Ajouter la classe d'animation
    button.classList.add("lightSpeedInLeft");
  }
  else {
    console.error("Le bouton avec l'ID 'sort-btn' n'a pas été trouvé dans le DOM.");
  }
};

// ########## Chargement du DOM ########## //
document.addEventListener('DOMContentLoaded', () => {
  addAnimationClass();

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
