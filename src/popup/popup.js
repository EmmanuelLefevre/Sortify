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


// ########## Initialiser JSON du local storage ########## //
// Initialiser données des notifications
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
  // Récupérer état des alertes depuis le localStorage ou initialiser objet vide (en guise de fallback si données inexistantes)
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


// ########## Gérer MAJ de l'état des notifications ########## //
const updateNotificationStatus = (status) => {
  const notifData = getLocalStorage("SortifyNotifications");

  if (notifData) {
    // MAJ état des notifications (true ou false)
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

  // Déterminer type de notification
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
      // Quitter si type invalide
      return;
  }

  // Vérifier si notifications sont supportées par le navigateur
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

// ########## Initialiser permissions + gérer état bouton de notifications ########## //
const updateButtonVisibility = (button, shouldShow) => {
  button.style.display = shouldShow ? 'flex' : 'none';
};

// ########## Gérer état initial des permissions notifications et de son bouton ########## //
const initializeNotificationPermissions = (enableNotifsButton) => {
  // Initialiser ou récupérer SortifyNotifications à partir du localStorage
  const notificationsLocalStorage = initializeNotificationsStorage();
  // Initialiser ou récupérer SortifyAlerts à partir du localStorage
  initializeAlertStorage();

  // Gestion des permissions
  switch (Notification.permission) {
    // Masquer bouton si permission accordée
    case "granted":
      if (!notificationsLocalStorage.notif) {
        updateNotificationStatus(true);
      }
      updateButtonVisibility(enableNotifsButton, false);
      break;

    // Afficher bouton si état "denied" + alert
    case "denied":
      updateButtonVisibility(enableNotifsButton, true);
      updateNotificationStatus(false);
      showAlert("denied_notifications", "🤬🤬🤬 Notifications refusées! 🤬🤬🤬");
      break;

    // Afficher bouton si état "default" + alert
    case "default":
      updateButtonVisibility(enableNotifsButton, true);
      updateNotificationStatus(false);
      showAlert("default_notifications", "Activer vos notifications svp 👉👉👉");
      break;

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

// ########## Gérer les clics sur le bouton de notifications ########## //
const handleNotificationButtonClick = (enableNotifsButton) => {
  enableNotifsButton.addEventListener('click', async (_event) => {
    try {
      // Vérifier si API chrome.tabs.create est disponible
      if (chrome.tabs && chrome.tabs.create) {
        // Ouvrir onglet paramètres de notifications de Chrome
        chrome.tabs.create({ url: 'chrome://settings/content/notifications' });
      }
      else {
        console.warn("API chrome.tabs non supportée!");
        createNotification('chrome');
        return;
      }

      // Vérifier si autorisation a changée
      const checkPermission = setInterval(() => {
        if (Notification.permission === 'granted') {
          clearInterval(checkPermission);
          updateNotificationStatus(true);
          updateButtonVisibility(enableNotifsButton, false);
        }
      }, 1000);

      // Arrêter vérification après 15 secondes si permission n'est pas accordée
      setTimeout(() => clearInterval(checkPermission), 15000);
    }
    catch (err) {
      console.error("Erreur: ", err);
      createNotification('error');
    }
  });
};

// ########## Ajouter animations sur bouton d'ajout des favoris ########## //
const addBtnBookmarkAnimations = () => {
  const button = document.getElementById("add-bookmark-btn");
  const rotatingBorder = document.querySelector('.rotating-border-line');

  if (!button) {
    console.warn("Le bouton avec l'ID 'add-bookmark-btn' n'a pas été trouvé dans le DOM.");
    return;
  }

  // Ajouter la classe d'animation
  button.classList.add("lightSpeedInLeft");

  // Ajouter l'animation au hover
  const toggleDisplay = (state) => rotatingBorder.style.display = state ? 'block' : 'none';
  button.addEventListener('mouseenter', () => toggleDisplay(true));
  button.addEventListener('mouseleave', () => toggleDisplay(false));
};

// ########## Ajouter animation sur bouton d'ajout des favoris ########## //
const addHoverEffect = () => {
  const button = document.getElementById('add-bookmark-btn');
  const rotatingBorder = document.querySelector('.rotating-border-line');

  if (!button || !rotatingBorder) {
      console.warn("Le bouton ou la bordure animée est introuvable dans le DOM.");
      return;
  }

  button.addEventListener('mouseenter', () => {
      rotatingBorder.style.display = 'block';
  });

  button.addEventListener('mouseleave', () => {
      rotatingBorder.style.display = 'none';
  });
};


// ########## Validation formulaire ajout de favoris ########## //

// ########## Validation formulaire création de catégories ########## //
const form = document.getElementById('category-form');
const input = document.getElementById('category-input');
const span = document.getElementById('border-input');
const submitButton = document.getElementById('add-category-btn');

// Injecter "required" et forcer saisie (plage 2/21 caractères)
input.setAttribute('required', true);
input.setAttribute('minlength', 2);
input.setAttribute('maxlength', 21);

// Activer / désactiver bouton soumission
const toggleLabelSubmitButton = () => {
  submitButton.disabled = input.validity.valid ? false : true;
};

// Écouter changements d'état de l'input
input.addEventListener('input', () => {
  // Vérifier validité input et activer/désactiver bouton
  toggleLabelSubmitButton();
});

form.addEventListener('submit', (event) => {
  // Empêcher soumission formulaire input invalide
  event.preventDefault();

  if (input.validity.valid) {
    span.classList.add('valid');
    span.classList.remove('invalid');
    input.classList.remove('headshake');
    form.submit();
  }
  else {
    span.classList.add('invalid');
    input.classList.add('headshake');
    span.classList.remove('valid');
  }
});

// ########## Chargement du DOM ########## //
document.addEventListener('DOMContentLoaded', () => {
  addBtnBookmarkAnimations();

  const enableNotifsButton = document.getElementById("notifs-content");
  if (!enableNotifsButton) {
    console.warn("Le bouton de notifications est introuvable dans le DOM.");
    return;
  }

  // Initialiser état des permissions
  initializeNotificationPermissions(enableNotifsButton);

  // Gérer clics bouton des permissions de notifications
  handleNotificationButtonClick(enableNotifsButton);

  // Initialiser état bouton de création de catégories
  toggleLabelSubmitButton();
});
