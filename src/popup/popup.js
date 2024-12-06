// ###################################### //
// ########## Chrome extension ########## //
// ###################################### //
const isChromeExtension = () => {
  return typeof chrome !== 'undefined' && typeof chrome.tabs !== 'undefined';
}

// ###################################################################### //
// ########## Utilitaires pour le local storage Sortify (JSON) ########## //
// ###################################################################### //
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

// ####################################################### //
// ########## Initialiser JSON du local storage ########## //
// ####################################################### //
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

// ######################################### //
// ########## Gestion des alertes ########## //
// ######################################### //
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

// ########################################################### //
// ########## Gérer MAJ de l'état des notifications ########## //
// ########################################################### //
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

// #################################################################################### //
// ########## Créer notifications desktop personnalisées en fonction du type ########## //
// #################################################################################### //
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

// ######################################################### //
// ########## Afficher container de notifications ########## //
// ######################################################### //
const updateNotifContainerVisibility = (element, shouldShow) => {
  element.style.display = shouldShow ? 'inline-block' : 'none';
};

// ########################################################################################## //
// ########## Gérer état initial des permissions notifications et de son container ########## //
// ########################################################################################## //
const initializeNotificationPermissions = () => {
  const notifsContainer = document.querySelector('.notifs-border-container');

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
      updateNotifContainerVisibility(notifsContainer, false);
      resetAlertStatus("default_notifications");
      break;

    // Afficher bouton si état "denied" + alert
    case "denied":
      updateNotifContainerVisibility(notifsContainer, true);
      updateNotificationStatus(false);
      showAlert("denied_notifications", "🤬 Réactiver vos notifications! 🤬");
      break;

    // Afficher bouton si état "default" + alert
    case "default":
      updateNotifContainerVisibility(notifsContainer, true);
      updateNotificationStatus(false);
      showAlert("default_notifications", "Activer vos notifications svp 👉");
      break;

    default:
      updateNotifContainerVisibility(notifsContainer, true);
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

// ########################################################### //
// ########## Gestion clics bouton de notifications ########## //
// ########################################################### //
const handleNotificationButtonClick = () => {
  const notifsButton = document.getElementById("enable-notifs");
  const notifsContainer = document.querySelector('.notifs-border-container');

  if (!notifsButton) {
    console.warn("Element with ID 'enable-notifs' was not found in the DOM.");
    return;
  }
  if (!notifsContainer) {
    console.warn("Element with class 'notifs-border-container' was not found in the DOM.");
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
          updateNotifContainerVisibility(notifsContainer, false);
          resetAlertStatus("default_notifications");
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

// ####################################################################### //
// ########## Ajouter animations sur bouton d'ajout des favoris ########## //
// ####################################################################### //
const addBtnBookmarkAnimations = () => {
  const submitBookmarkButton = document.getElementById("add-bookmark-btn");
  const rotatingBorder = document.querySelector('.rotating-border-line');

  if (!submitBookmarkButton) {
    console.warn("Button with ID 'add-bookmark-btn' was not found in the DOM.");
    return;
  }
  if (!rotatingBorder) {
    console.warn("Element with class 'rotating-border-line' was not found in the DOM.");
    return;
  }

  // Ajouter la classe d'animation
  submitBookmarkButton.classList.add("lightSpeedInLeft");

  // Ajouter l'animation au hover
  const toggleDisplay = (state) => rotatingBorder.style.display = state ? 'block' : 'none';
  submitBookmarkButton.addEventListener('mouseenter', () => toggleDisplay(true));
  submitBookmarkButton.addEventListener('mouseleave', () => toggleDisplay(false));
};

// ################################################# //
// ########## Formulaire ajout de favoris ########## //
// ################################################# //
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

// ################################################################## //
// ########## Validation formulaire création de catégories ########## //
// ################################################################## //
const categoryForm = document.getElementById('category-form');
const categoryInput = document.getElementById('category-input');
const spanCategoryBorder = document.getElementById('category-border-input');
const submitCategoryButton = document.getElementById('add-category-btn');
const categoryInputContainer = document.querySelector('.category-input-container');
const categoryIcon = document.querySelector('.category-icon');
const spanCategoryTooltip = document.querySelector('.category-tooltip');

// Désactiver submit bouton
submitCategoryButton.disabled = true;

// Vérifier si utilisateur a déjà saisi
let categoryHasTyped = false;

// Injecter les contraintes de validation
categoryInput.setAttribute('required', true);
categoryInput.setAttribute('minlength', 3);

// Message d'erreur
const categoryErrorMessage = document.createElement('span');
categoryErrorMessage.id = 'category-error-message';
categoryInputContainer.insertAdjacentElement('afterend', categoryErrorMessage);

// Activer / désactiver bouton soumission
const toggleSubmitButtonState = () => {
  submitCategoryButton.disabled = !categoryInput.validity.valid;
};

// Comportement de validation
const updateValidationState = () => {
  const value = categoryInput.value.trim();
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
    categoryInput.setCustomValidity('invalid');
    spanCategoryBorder.classList.add('invalid');
    categoryInput.classList.add('invalid');
    categoryInput.classList.add('headshake');

    // Afficher message d'erreur
    categoryErrorMessage.textContent = error;
    categoryErrorMessage.classList.add('show');

    // Modifier texte tooltip
    spanCategoryTooltip.textContent = 'Saisie invalide';
  }
  else {
    categoryInput.setCustomValidity('');
    spanCategoryBorder.classList.remove('invalid');
    spanCategoryBorder.classList.add('valid');
    categoryInput.classList.remove('invalid');
    categoryInput.classList.remove('headshake');

    // Effacer message d'erreur
    categoryErrorMessage.textContent = '';
    categoryErrorMessage.classList.remove('show');

    // Modifier texte tooltip
    spanCategoryTooltip.textContent = 'Créer';
  }
};

// Écouter événements changements d'état de l'input
categoryInput.addEventListener('input', () => {
  // MAJ état de saisie
  const value = categoryInput.value.trim();
  if (value !== '') {
    categoryHasTyped = true;
  }

  updateValidationState();

  // Focus + input vide + état saisie = true
  if (categoryHasTyped && value === '' && document.activeElement === categoryInput) {
    spanCategoryTooltip.textContent = 'Rejoues';
  }
  else if (value === '') {
    spanCategoryTooltip.textContent = 'Saisir';
  }

  toggleSubmitButtonState();
});

// Input unfocus (masquer message d'erreur + retirer classe de validation si input vide)
categoryInput.addEventListener('blur', () => {
  if (!categoryInput.validity.valid && categoryInput.value.trim() === '') {
    spanCategoryBorder.classList.remove('invalid');
    spanCategoryBorder.classList.remove('valid');
    categoryInput.classList.remove('headshake');
    categoryErrorMessage.textContent = '';
    categoryErrorMessage.classList.remove('show');
    spanCategoryTooltip.textContent = 'Saisir';
    categoryHasTyped = false;
  }
});

// Soumission formulaire
categoryForm.addEventListener('submit', (event) => {
  // Empêcher soumission formulaire si input invalide
  event.preventDefault();

  updateValidationState();
  if (categoryInput.validity.valid) {
    categoryForm.submit();
  }
});

// ####################################### //
// ########## Chargement du DOM ########## //
// ####################################### //
document.addEventListener('DOMContentLoaded', () => {
  addBtnBookmarkAnimations();
  initializeNotificationPermissions();
  handleNotificationButtonClick();
  toggleSubmitButtonState();
});
