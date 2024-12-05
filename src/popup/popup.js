// ########## Chrome extension ########## //
const isChromeExtension = () => {
  return typeof chrome !== 'undefined' && typeof chrome.tabs !== 'undefined';
}

// ########## Utilitaires pour le local storage Sortify (JSON) ########## //
// Setter
const setLocalStorage = (key, value) => {
  // Validation
  if (typeof value !== 'object' || value === null) {
    console.error("Invalid local storage data format: expected an object!");
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  }
  catch (error) {
    console.warn("Local storage not found!");
  }
};

// Getter avec fallback en cas de données invalides
const getLocalStorage = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (value) {
      const parsedValue = JSON.parse(value);

      // Validation
      if (typeof parsedValue === 'object' && parsedValue !== null) {
        if (key === 'SortifyNotifications' && 'notifications' in parsedValue) {
          return parsedValue;
        }
        else if (key === 'SortifyAlerts' &&
                         'denied_notifications' in parsedValue &&
                         'default_notifications' in parsedValue &&
                         'unsupported_notifications' in parsedValue) {
          return parsedValue;
        }
      }
      else {
        console.error("Invalid data structure!");
        return null;
      }
    }
    return null;
  }
  catch (error) {
    console.error(`Error tretrieving "${key}" from localStorage:`, error);
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
  // Vérifier si key est passer en paramètre
  if (key !== undefined) {
    // Récupérer état des alertes depuis le localStorage ou initialiser objet vide (en guise de fallback si données inexistantes)
    const alertStatus = getLocalStorage("SortifyAlerts") || {};

    // Vérifier si l'alerte a déjà été affichée
    if (!alertStatus[key]) return;

    // Désactiver l'alerte après l'affichage
    alertStatus[key] = false;
    setLocalStorage("SortifyAlerts", alertStatus);
  }

  // Afficher l'alerte après le délai spécifié
  setTimeout(() => alert(message), timeout);
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
    notifData.notifications = status;
    setLocalStorage("SortifyNotifications", notifData);

    // Créer notification uniquement lorsque les notifications sont activées
    if (status) {
      createNotification('notif-success');
    }
    else {
      resetAlertStatus("denied_notifications");
    }
  }
  else {
    console.error("Unable to update notification status, invalid localStorage!");
  }
};


// ########## Créer notifications desktop personnalisées en fonction du type ########## //
const createNotification = (type) => {
  let message;
  let body;
  let icon;

  // Déterminer type de notification
  switch (type) {
    case 'notif-success':
      message = 'Sortify';
      body = '🚀 Les notifications sont activées!';
      icon = '../assets/logo/logo.png';
      break;
    case 'bookmark':
      message = 'Sortify';
      body = '✔️ Le favori a été ajouté!';
      icon = '../assets/logo/logo.png';
      break;
    case 'error':
      message = 'Sortify';
      body = '⚰️ Une erreur est survenue!';
      icon = '../assets/logo/logo.png';
      break;
    case 'server-error':
      message = 'Sortify';
      body = '💣 Une erreur serveur est survenue!';
      icon = '../assets/logo/logo.png';
      break;
    case 'offline-server':
      message = 'Sortify';
      body = '🗄️ Le serveur semble hors-ligne!';
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
      console.warn(`Unknown notification type: "${type}".`);
      // Quitter si type invalide
      return;
  }

  // Vérifier si notifications sont supportées par le navigateur
  if ("Notification" in window) {
    new Notification(message, {
      body: body,
      icon: icon,
      silent: true
    });
  }
  else {
    showAlert("unsupported_notifications", "💀💀💀 Les notifications ne sont pas supportées par ce navigateur!");
  }
};

// ########## Afficher container de notifications ########## //
const updateNotifContentVisibility = (element, shouldShow) => {
  element.style.display = shouldShow ? 'inline-block' : 'none';
};

// ########## Gérer état initial des permissions notifications et de son container ########## //
const initializeNotificationPermissions = () => {
  const notifContent = document.querySelector('.notifs-border-content');

  // Initialiser ou récupérer SortifyNotifications à partir du localStorage
  const notificationsLocalStorage = initializeNotificationsStorage();
  // Initialiser ou récupérer SortifyAlerts à partir du localStorage
  initializeAlertStorage();

  // Gestion des permissions
  switch (Notification.permission) {
    // Masquer bouton si permission accordée
    case "granted":
      if (!notificationsLocalStorage.notifications) {
        updateNotificationStatus(true);
      }
      updateNotifContentVisibility(notifContent, false);
      resetAlertStatus("default_notifications");
      // setLocalStorage("SortifyAlerts", { ...getLocalStorage("SortifyAlerts"), default_notifications: true });
      break;

    // Afficher bouton si état "denied" + alert
    case "denied":
      updateNotifContentVisibility(notifContent, true);
      updateNotificationStatus(false);
      showAlert("denied_notifications", "🤬🤬🤬 Notifications refusées! 🤬🤬🤬");
      break;

    // Afficher bouton si état "default" + alert
    case "default":
      updateNotifContentVisibility(notifContent, true);
      updateNotificationStatus(false);
      showAlert("default_notifications", "Activer vos notifications svp 👉👉👉");
      break;

    default:
      updateNotifContentVisibility(notifContent, true);
      updateNotificationStatus(false);
      if ("Notification" in window && Notification.permission === "granted") {
        createNotification('error');
      }
      else {
        showAlert("⚰️  Une erreur est survenue!");
      }
      break;
  }
};

// ########## Gérer les clics sur le bouton de notifications ########## //
const handleNotificationButtonClick = () => {
  const notifsButton = document.getElementById("enable-notifs");
  const notifContent = document.querySelector('.notifs-border-content');

  if (!notifsButton) {
    console.warn("Element with ID 'enable-notifs' was not found in the DOM.");
    return;
  }
  if (!notifContent) {
    console.warn("Element with class 'notifs-border-content' was not found in the DOM.");
    return;
  }

  notifsButton.addEventListener('click', async (_event) => {
    try {
      if (isChromeExtension()) {
        // Ouvrir onglet paramètres de notifications de Chrome
        chrome.tabs.create({url:'chrome://settings/content/notifications'});
      }
      else {
        console.warn("API Chrome not supported!");
        return;
      }

      // Vérifier si autorisation a changée
      const checkPermission = setInterval(() => {
        if (Notification.permission === 'granted') {
          clearInterval(checkPermission);
          updateNotificationStatus(true);
          updateNotifContentVisibility(notifContent, false);
          resetAlertStatus("default_notifications");
          // setLocalStorage("SortifyAlerts", { ...getLocalStorage("SortifyAlerts"), default_notifications: true });
        }
      }, 1000);

      // Arrêter vérification après 15 secondes si permission n'est pas accordée
      setTimeout(() => clearInterval(checkPermission), 15000);
    }
    catch (err) {
      console.error("Error: ", err);
      createNotification('error');
    }
  });
};

// ########## Ajouter animations sur bouton d'ajout des favoris ########## //
const addBtnBookmarkAnimations = () => {
  const button = document.getElementById("add-bookmark-btn");
  const rotatingBorder = document.querySelector('.rotating-border-line');

  if (!button) {
    console.warn("Button with ID 'add-bookmark-btn' was not found in the DOM.");
    return;
  }
  if (!rotatingBorder) {
    console.warn("Element with class 'rotating-border-line' was not found in the DOM.");
    return;
  }

  // Ajouter la classe d'animation
  button.classList.add("lightSpeedInLeft");

  // Ajouter l'animation au hover
  const toggleDisplay = (state) => rotatingBorder.style.display = state ? 'block' : 'none';
  button.addEventListener('mouseenter', () => toggleDisplay(true));
  button.addEventListener('mouseleave', () => toggleDisplay(false));
};

// ########## Formulaire ajout de favoris ########## //
document.getElementById('bookmark-form').addEventListener('submit', function (event) {
  // Empêcher le rechargement de la page
  event.preventDefault();

  if(isChromeExtension()) {
    chrome.runtime.sendMessage({ action: 'sendActiveTabUrl' }, function(response) {
      switch (true) {
        case response.success:
          if (Notification.permission === 'granted') {
            createNotification('bookmark');
          }
          else {
            showAlert("✔️ Le favori a été ajouté!");
          }
          console.log('Bookmark added:', response.data);
          break;

        case !response.success && response.error === 'offline':
          if (Notification.permission === 'granted') {
            createNotification('offline-server');
          }
          else {
            showAlert("🗄️ Le serveur semble hors-ligne!");
          }
          console.error('Offline server:', response.error);
          break;

        case !response.success:
          if (Notification.permission === 'granted') {
            createNotification('server-error');
          }
          else {
            showAlert("💣 Une erreur serveur est survenue!");
          }
          console.error('Server error:', response.error);
          break;

        default:
          if (Notification.permission === 'granted') {
            createNotification('error');
          }
          else {
            showAlert("⚰️ Une erreur est survenue!");
          }
          console.warn("Erreur: ", response);
          break;
      }
    });
  }
  else {
    console.warn("You should execute this extension in a Chrome environment!");
  }
});


// ########## Validation formulaire création de catégories ########## //
const form = document.getElementById('category-form');
const input = document.getElementById('category-input');
const span = document.getElementById('border-input');
const submitButton = document.getElementById('add-category-btn');
const categoryInputContainer = document.querySelector('.category-input-container');
const categoryIcon = document.querySelector('.category-icon');
const spanTooltip = document.querySelector('.tooltip');

// Désactiver submit bouton
submitButton.disabled = true;

// Vérifier si utilisateur a déjà saisi
let hasTyped = false;

// Injecter les contraintes de validation
input.setAttribute('required', true);
input.setAttribute('minlength', 3);

// Message d'erreur
const errorMessage = document.createElement('span');
errorMessage.id = 'error-message-content';
categoryInputContainer.insertAdjacentElement('afterend', errorMessage);

// Activer / désactiver bouton soumission
const toggleSubmitButtonState = () => {
  submitButton.disabled = !input.validity.valid;
};

// Comportement de validation
const updateValidationState = () => {
  const value = input.value.trim();
  let error = '';

  switch (true) {
    case value.length === 0:
      error = '⚠️ Le champ ne peut pas être vide!';
      break;

    case value.length < 3:
      error = '⚠️ Taille minimum de 3 caractères!';
      break;

    case value.length > 25:
      error = '⚠️ Taille maximum de 25 caractères!';
      break;

    case !/^[A-Za-z0-9]*$/.test(value):
      error = '⚠️ (A-Z, a-z) et (0-9) autorisés!';
      break;

    default:
      error = '';
  }

  // Invalidité si erreur détectée
  if (error) {
    input.setCustomValidity('invalid');
    span.classList.add('invalid');
    input.classList.add('invalid');
    input.classList.add('headshake');

    // Afficher message d'erreur
    errorMessage.textContent = error;
    errorMessage.classList.add('show');

    // Modifier texte du tooltip
    spanTooltip.textContent = 'Saisie invalide';
  }
  else {
    input.setCustomValidity('');
    span.classList.remove('invalid');
    span.classList.add('valid');
    input.classList.remove('invalid');
    input.classList.remove('headshake');

    // Effacer message d'erreur
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');

    // Modifier texte du tooltip
    spanTooltip.textContent = 'Créer';
  }
};

// Écouter événements changements d'état de l'input
input.addEventListener('input', () => {
  // Utilisateur a saisi
  const value = input.value.trim();
  if (value !== '') {
    hasTyped = true;
  }

  // Vérifier si input vide après saisie
  if (hasTyped && value === '') {
    spanTooltip.textContent = 'Rejoues';
  }
  else if (value !== '') {
    spanTooltip.textContent = 'Créer';
  }

  updateValidationState();
  toggleSubmitButtonState();
});

// Input focus + vide + utilisateur a déjà saisi
// input.addEventListener('focus', () => {
//   if (hasTyped && input.value.trim() === '') {
//     spanTooltip.textContent = 'Rejoues';
//   }
// });

// Input unfocus (masquer message d'erreur + retirer classe de validation si input vide)
input.addEventListener('blur', () => {
  if (!input.validity.valid && input.value.trim() === '') {
    span.classList.remove('invalid');
    span.classList.remove('valid');
    input.classList.remove('headshake');
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
    spanTooltip.textContent = 'Saisir';
  }
});

// Gérer soumission formulaire
form.addEventListener('submit', (event) => {
  // Empêcher soumission formulaire si input invalide
  event.preventDefault();

  updateValidationState();
  if (input.validity.valid) {
    form.submit();
  }
});



// ########## Chargement du DOM ########## //
document.addEventListener('DOMContentLoaded', () => {
  addBtnBookmarkAnimations();
  initializeNotificationPermissions();
  handleNotificationButtonClick();
  toggleSubmitButtonState();
});
