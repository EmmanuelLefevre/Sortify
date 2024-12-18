/*
 * Copyright (c) Novembre 2024
 * LEFEVRE Emmanuel
 * Cod!ngT3kSolutions, SIRET: 50863331000026
 * Tous droits réservés.
 *
 * Licence propriétaire Sortify. Aucun droit n'est accordé en dehors des conditions spécifiées dans la présente licence.
 * Pour plus de détails, consultez le fichier LICENSE.md
*/

// ###################################### //
// ########## Chrome extension ########## //
// ###################################### //
const isChromeExtension = () => {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    return true;
  }
  else {
    console.error("You should execute this extension in a Chrome environment!");
    return false;
  }
}

// ################################################################ //
// ########## Getter/Setter local storage Sortify (JSON) ########## //
// ################################################################ //
// ##### Setter ##### //
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
    console.error("Local storage not found!");
  }
};

// ##### Getter avec fallback en cas de données invalides ##### //
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
    console.error(`Error retrieving "${key}" from localStorage:`, error);
    // Retourner null en cas de données corrompues
    return null;
  }
};

// ####################################################### //
// ########## Initialiser JSON du local storage ########## //
// ####################################################### //
// ##### Initialiser données des notifications ##### //
const initializeNotificationsStorage = () => {
  const defaultNotificationPermission = { notifications: false };
  const notifData = getLocalStorage("SortifyNotifications");

  if (!notifData) {
    setLocalStorage("SortifyNotifications", defaultNotificationPermission);
    return defaultNotificationPermission;
  }
  return notifData;
};

// ##### Initialiser les données des alertes ##### //
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
// ##### Afficher une alerte personnalisée si elle n'a pas déjà été affichée ##### //
const showAlertOnce = (key, message, timeout = 2000) => {
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

  // Afficher l'alerte après le délai spécifié ##### //
  setTimeout(() => alert(message), timeout);
};

// ##### Réactiver une alerte spécifique
const resetAlertStatus = (key) => {
  const alertStatus = getLocalStorage("SortifyAlerts") || {};
  alertStatus[key] = true;
  setLocalStorage("SortifyAlerts", alertStatus);
};

// ##### Alerte normale ##### //
const showAlert = (message, timeout = 2000) => {
  setTimeout(() => alert(message), timeout);
}

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

    case 'bookmark-already-exists':
      message = 'Sortify';
      body = '🖖 Le favori existe déjà!';
      icon = '../assets/logo/logo.png';
      break;

    case 'category':
      message = 'Sortify';
      body = '✔️ La catégorie a été ajoutée!';
      icon = '../assets/logo/logo.png';
      break;

    case 'category-already-exists':
      message = 'Sortify';
      body = '🖖 La catégorie existe déjà!';
      icon = '../assets/logo/logo.png';
      break;

    case 'update-category':
      message = 'Sortify';
      body = '✔️ La catégorie a été modifiée!';
      icon = '../assets/logo/logo.png';
      break;

    case 'not-found':
      message = 'Sortify';
      body = '👀 404 not found!';
      icon = '../assets/logo/logo.png';
      break;

    case 'unexpected-error':
      message = 'Sortify';
      body = '⚰️ Une erreur est survenue!';
      icon = '../assets/logo/logo.png';
      break;

    case 'server-error':
      message = 'Sortify';
      body = '💣 Une erreur serveur est survenue!';
      icon = '../assets/logo/logo.png';
      break;

    case 'client-error':
      message = 'Sortify';
      body = '🖥️ Une erreur client est survenue!';
      icon = '../assets/logo/logo.png';
      break;

    case 'unexpected-http-error':
      message = 'Sortify';
      body = '😱 Erreur http inconnue!';
      icon = '../assets/logo/logo.png';
      break;

    case 'network-error':
      message = 'Sortify';
      body = '🌩️ Une erreur réseau est survenue!';
      icon = '../assets/logo/logo.png';
      break;

    case 'offline-server':
      message = 'Sortify';
      body = '🗄️ Le serveur semble hors-ligne!';
      icon = '../assets/logo/logo.png';
      break;

    case 'dns-error':
      message = 'Sortify';
      body = '🌍 Domaine introuvable!';
      icon = '../assets/logo/logo.png';
      break;

    case 'forbidden':
      message = 'Sortify';
      body = '⛔ Connexion refusée!';
      icon = '../assets/logo/logo.png';
      break;

    default:
      console.error(`Unknown notification type: "${type}".`);
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
    showAlertOnce("unsupported_notifications", "💀 Les notifications ne sont pas supportées par ce navigateur!");
  }
};

// ######################################################### //
// ########## Afficher container de notifications ########## //
// ######################################################### //
const updateNotifContainerVisibility = (element, shouldShow) => {
  element.style.display = shouldShow ? 'inline-block' : 'none';
};

// #################################################################################### //
// ########## Etat initial des permissions notifications et de son container ########## //
// #################################################################################### //
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
      showAlertOnce("denied_notifications", "🤬 Réactiver vos notifications! 🤬");
      break;

    // Afficher bouton si état "default" + alert
    case "default":
      updateNotifContainerVisibility(notifsContainer, true);
      updateNotificationStatus(false);
      showAlertOnce("default_notifications", "Activer vos notifications svp 👉");
      break;

    default:
      updateNotifContainerVisibility(notifsContainer, true);
      updateNotificationStatus(false);
      if ("Notification" in window && Notification.permission === "granted") {
        createNotification('unexpected-error');
      }
      else {
        showAlert("⚰️ Une erreur est survenue!");
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

  notifsButton.addEventListener('click', async (_event) => {
    try {
      if (isChromeExtension()) {
        chrome.permissions.request({
          permissions: ["notifications"]
        }, function (granted) {
          if (granted) {
            updateNotificationStatus(true);
            updateNotifContainerVisibility(notifsContainer, false);
            resetAlertStatus("default_notifications");
          }
          else {
            console.warn("Permission de notification refusée!")
          }
        }
      );

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
      else {
        console.error("You should execute this extension in a Chrome environment!");
        return;
      }
    }
    catch (err) {
      createNotification('unexpected-error');
    }
  });
};

// ################################# //
// ########## Animations  ########## //
// ################################# //
// ##### Bouton ajout des favoris ##### //
const addBtnBookmarkAnimations = () => {
  const submitBookmarkButton = document.getElementById("bookmark-btn");
  const rotatingBorder = document.querySelector('.rotating-border-line');

  // Ajouter la classe d'animation
  submitBookmarkButton.classList.add("leftEntrance");

  // Ajouter l'animation au hover
  const toggleDisplay = (state) => rotatingBorder.style.display = state ? 'block' : 'none';
  submitBookmarkButton.addEventListener('mouseenter', () => toggleDisplay(true));
  submitBookmarkButton.addEventListener('mouseleave', () => toggleDisplay(false));
};

// ##### Select modifier la catégorie ##### //
const addSelectUpdateCategoryAnimation = () => {
  const selectUpdateCategory = document.querySelector('.update-category-select-container');
  selectUpdateCategory.classList.add("bounce");
}

// ############################################################## //
// ########## Fonctions utilitaires inputs formulaires ########## //
// ############################################################## //
// ##### Fonction capitalize ##### //
function capitalizeWords(str) {
  return str
    // Diviser la chaîne en mots
    .split(' ')
    // Première lettre en majuscule et reste en minuscule
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    // Réassembler la chaîne
    .join(' ');
}

// ##### Ajouter le comportement capitalize aux inputs ##### //
const addCapitalizationToInputs = () => {
  const inputs = document.querySelectorAll('input[type="text"]');

  inputs.forEach(input => {
    input.addEventListener('input', event => {
      event.target.value = capitalizeWords(event.target.value);
    });
  });
}

// ##### Validation des inputs ##### //
const validateInput = (value) => {
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

    case !/^[A-Za-z0-9\u00C0-\u017F\-_ +=()]*$/.test(value):
      error = '⚠️ (A-Z, a-z) et (0-9) autorisés!';
      break;

    default:
      error = '';
  }

  return error;
};

// ################################################################################### //
// ########## Fonctions utilitaires formulaires Background/Validation/Error ########## //
// ################################################################################### //
// ##### Fonction asynchrone pour envoyer l'action à effectuer dans background.js ##### //
async function sendMessageAsync(requestData) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(requestData , function(response) {
      if (response.success) {
        resolve(response);
      }
      else {
        reject(response);
      }
    });
  });
}

// ##### Afficher erreurs (notifications / alertes) du service worker en fonction de la permission ##### //
function displayServiceWorkerError(notificationType, message) {
  if (Notification.permission === 'granted') {
    createNotification(notificationType);
  }
  else {
    showAlert(message);
  }
}

// ##### Gérer erreurs provenant du service worker ##### //
// Variable pour suivre si une erreur API a eu lieu
let apiErrorOccurred = false;

function handleServiceWorkerError(error) {
  // Accéder directement à l'objet error (propriété 'error' ou objet entier)
  const errorType = error.error || error;
  // Récupérer type (favori ou catégorie)
  const errorSubtype = error.type || '';

  switch (errorType) {
    case 'offline-server':
      displayServiceWorkerError('offline-server', "🗄️ Le serveur semble hors-ligne!");
      break;

    case 'server-error':
      displayServiceWorkerError('server-error', "💣 Une erreur serveur est survenue!");
      break;

    case 'not-found':
      displayServiceWorkerError('not-found', "👀 404 not found!");
      break;

    case 'client-error':
      displayServiceWorkerError('client-error', "🖥️ Une erreur client est survenue!");
      break;

    case 'unexpected-http-error':
      displayServiceWorkerError('unexpected-http-error', "❓ Erreur http inconnue!");
      break;

    case 'dns-error':
      displayServiceWorkerError('dns-error', "🌍 Domaine introuvable!");
      break;

    case 'forbidden':
      displayServiceWorkerError('forbidden', "⛔ Connexion refusée!");
      break;

    case 'network-error':
      displayServiceWorkerError('network-error', "🌩️ Une erreur réseau est survenue!");
      break;

    case 'already-exists':
      if (errorSubtype === 'category') {
        displayServiceWorkerError('category-already-exists', "🖖 La catégorie existe déjà!");
        apiErrorOccurred = true;
        submitCategoryButton.disabled = true;
        spanCategoryTooltip.textContent = 'Rejoues';
        categoryInput.classList.add('headShake');
        spanCategoryBorder.classList.add('invalid');
        categoryInput.classList.add('invalid');
      }
      else if (errorSubtype === 'bookmark') {
        displayServiceWorkerError('bookmark-already-exists', "🖖 Le favori existe déjà!");
      }
      break;

    default:
      displayServiceWorkerError('unexpected-error', "⚰️ Une erreur est survenue!");
      break;
  }
}

// ############################################################ //
// ########## Hydrater les catégories dans le select ########## //
// ############################################################ //
const updateCategoryForm = document.getElementById('update-category-form');
const updateCategoryInput = document.getElementById('update-category-input');
const updateCategoriesSelect = document.getElementById('update-categories-select');
const updateCategoriesList = document.getElementById('update-category-select-options');

async function updateCategoriesSelectList() {
  if(isChromeExtension()) {
    try {
      const response = await sendMessageAsync({ action: 'loadCategories' });

      // Récupérer les catégories
      const categories = response.data;

      // Vider la liste existante avant de la remplir
      updateCategoriesList.innerHTML = '';

      // Ajouter les catégories dans le select
      categories.forEach(([id, name]) => {
        const listItem = document.createElement('li');
        listItem.textContent = name;
        listItem.dataset.id = id;
        listItem.setAttribute('data-value', id);
        updateCategoriesList.appendChild(listItem);
      });
    }
    catch (error) {
      handleServiceWorkerError(error);
    }
  }
}

// ############################################ //
// ########## Select update category ########## //
// ############################################ //
// ##### Dropdown select options ##### //
const updateCategorySelectButton = document.getElementById('update-category-select');
const updateCategorySelectContent = document.querySelector('.update-category-select-content');
const updateCategorySelectOptions = document.getElementById('update-category-select-options');
const updateCategorySelectItems = updateCategorySelectOptions.getElementsByTagName('li');
const updateCategoryInputContainer = document.querySelector('.update-category-input-container');
const rotatingSelectBorderLine = document.querySelector('.rotating-select-border-line');
const sortifyContent = document.querySelector('.sortify-content');

// ##### Chargement du DOM => masquer input + initialiser texte du bouton ##### //
document.addEventListener('DOMContentLoaded', () => {
  updateCategoryInputContainer.style.display = 'none';
  updateCategorySelectButton.textContent = 'Modifier catégorie';
});

// ##### Toggle liste des options ##### //
updateCategorySelectButton.addEventListener('click', function(event) {
  // Empêcher soumission du formulaire
  event.preventDefault();
  // Empêcher propagation de l'event
  event.stopPropagation();

  // Basculer l'état de la liste déroulante
  const isOpen = updateCategorySelectContent.classList.toggle('open');
  // Vérifier si l'input est déjà affiché
  const isInputVisible = updateCategoryInputContainer.style.display === 'flex';

  // Ne réinitialiser que si aucune catégorie sélectionnée + input n'est pas visible
  if (isOpen) {
    if (!isInputVisible) {
      // Liste ouverte, ajouter du padding si input masqué
      sortifyContent.style.setProperty('padding-bottom', '105px');
    }
  }
  else {
    // Liste fermée => réinitialiser le padding
    sortifyContent.style.setProperty('padding-bottom', isInputVisible ? '30px' : '15px');
  }
});

// ##### Stocker id catégorie à modifier ##### //
let oldCategoryId = '';

// ##### Option sélectionnée = true => maj bouton + fermer la liste des options + écouteur d'événements ##### //
updateCategorySelectOptions.addEventListener('click', function(event) {
  // Vérifier si l'élément cliqué est bien une option
  if (event.target.tagName.toLowerCase() === 'li') {
    // Empêcher soumission du formulaire
    event.preventDefault();
    // Empêcher propagation de l'event
    event.stopPropagation();

    const item = event.target;
    const value = item.getAttribute('data-value');
    const inputText = item.textContent.trim();

    // Récupérer UUID de la catégorie sélectionnée
    oldCategoryId = item.getAttribute('data-id');

    // Si l'option "Réinitialiser" est sélectionnée
    if (value === "") {
      // Réinitialiser état initial
      updateCategorySelectButton.textContent = 'Modifier catégorie';
      updateCategoryInputContainer.style.display = 'none';
      sortifyContent.style.setProperty('padding-bottom', '15px');

      // Supprimer l'option "Réinitialiser"
      const resetSelectedOption = document.querySelector('[data-value=""]');
      if (resetSelectedOption) resetSelectedOption.remove();

      // Fermer la liste des options
      updateCategorySelectContent.classList.remove('open');

      // Réinitialiser oldCategoryId (si "Réinitialiser" est sélectionnée)
      oldCategoryId = '';

      // Réinitialiser l'état de sélection
      isUpdateCategorySelected = false;

      // Reset formulaire
      updateCategoryForm.reset();
      // Reset input (par sécurité car déjà effectué par le reset formulaire)
      updateCategoryInput.value = '';

      toggleSubmitUpdateCategoryButtonState();
    }
    else {
      // Mise à jour du bouton et affichage de l'input
      updateCategorySelectButton.textContent = item.textContent;
      updateCategoryInputContainer.style.display = 'flex';
      sortifyContent.style.setProperty('padding-bottom', '30px');

      // Injecter le texte de l'option sélectionnée dans l'input
      updateCategoryInput.value = inputText;

      // Ajouter l'option "Réinitialiser" si elle n'est pas déjà présente
      if (!document.querySelector('[data-value=""]')) {
        const resetSelectedOption = document.createElement('li');
        resetSelectedOption.setAttribute('data-value', '');
        resetSelectedOption.textContent = 'Réinitialiser';
        updateCategorySelectOptions.prepend(resetSelectedOption);

        // Gestionnaire d'événement pour l'option "Réinitialiser"
        resetSelectedOption.addEventListener('click', function() {
          // Déclencher le comportement de réinitialisation
          updateCategorySelectButton.textContent = 'Modifier catégorie';
          updateCategoryInputContainer.style.display = 'none';
          sortifyContent.style.setProperty('padding-bottom', '15px');
          resetSelectedOption.remove();
          updateCategorySelectContent.classList.remove('open');

          // Réinitialiser oldCategoryId
          oldCategoryId = '';
        });
      }

      // Focus sur l'input
      updateCategoryInput.focus();
    }

    // Fermer la liste des options
    updateCategorySelectContent.classList.remove('open');
  }
});

// ##### Retirer animation du bouton au focus ##### //
updateCategorySelectButton.addEventListener('focus', function() {
  rotatingSelectBorderLine.style.display = 'none';
});
updateCategorySelectButton.addEventListener('blur', function() {
  rotatingSelectBorderLine.style.display = 'block';
});

// ##### Fonction pour refermer les options lors d'un clic dans la page ##### //
function closeSelectOptions(event) {
  // Vérifier si le clic provient du sélecteur ou de ses options
  if (!updateCategorySelectContent.contains(event.target)) {
    // Fermer les options si le clic est en dehors du sélecteur
    updateCategorySelectContent.classList.remove('open');
    // Liste fermée => réinitialiser le padding
    sortifyContent.style.setProperty('padding-bottom', '15px');
  }
}
// Ecouteur d'événements sur le document entier
document.addEventListener('click', closeSelectOptions);

// ################################################# //
// ########## Formulaire ajout de favoris ########## //
// ################################################# //
const bookmarkForm = document.getElementById('bookmark-form');

bookmarkForm.addEventListener('submit', async function (event) {
  // Empêcher soumission classique du formulaire
  event.preventDefault();

  if(isChromeExtension()) {
    try {
      // Récupérer le User-Agent du navigateur
      const userAgent = navigator.userAgent;

      const response = await sendMessageAsync({
        action: 'sendActiveTabUrl',
        userAgent: userAgent
      });

      if (response.success) {
        if (Notification.permission === 'granted') {
          createNotification('bookmark');
        }
        else {
          showAlert("✔️ Le favori a été ajouté!");
        }
      }
      else {
        if (Notification.permission === 'granted') {
          createNotification('unexpected-error');
        }
        else {
          showAlert("⚰️ Une erreur est survenue!");
        }
      }
    }
    catch (error) {
      handleServiceWorkerError(error);
    }
  }
  else {
    console.error("You should execute this extension in a Chrome environment!");
  }
});

// #################################################### //
// ########## Formulaire ajout de catégories ########## //
// #################################################### //
const categoryForm = document.getElementById('category-form');
const categoryInput = document.getElementById('category-input');
const spanCategoryBorder = document.getElementById('category-border-input');
const submitCategoryButton = document.getElementById('category-btn');
const categoryInputContainer = document.querySelector('.category-input-container');
const spanCategoryTooltip = document.querySelector('.category-tooltip');

// ##### Désactiver submit bouton ##### //
submitCategoryButton.disabled = true;

// ##### Vérifier si utilisateur a déjà saisi ##### //
let categoryHasTyped = false;

// ##### Injecter les contraintes de validation ##### //
categoryInput.setAttribute('required', true);
categoryInput.setAttribute('minlength', 3);

// ##### Message d'erreur ##### //
const categoryErrorMessage = document.createElement('span');
categoryErrorMessage.id = 'category-error-message';
categoryInputContainer.insertAdjacentElement('afterend', categoryErrorMessage);

// ##### Activer/désactiver bouton soumission ##### //
const toggleSubmitCategoryButtonState = () => {
  submitCategoryButton.disabled = !categoryInput.validity.valid;
};

// ##### Comportement de validation ##### //
const updateValidationState = () => {
  const value = categoryInput.value.trim();
  const error = validateInput(value);

  // Invalidité si erreur détectée
  if (error) {
    categoryInput.setCustomValidity('invalid');
    spanCategoryBorder.classList.add('invalid');
    categoryInput.classList.add('invalid');
    categoryInput.classList.add('headShake');

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
    categoryInput.classList.remove('headShake');

    // Effacer message d'erreur
    categoryErrorMessage.textContent = '';
    categoryErrorMessage.classList.remove('show');

    // Modifier texte tooltip
    spanCategoryTooltip.textContent = 'Créer';
  }
};

// ##### Écouter événements changements d'état de l'input ##### //
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

  toggleSubmitCategoryButtonState();

});

// ##### Écouter événement focus après une erreur API ##### //
categoryInput.addEventListener('focus', () => {
  if (apiErrorOccurred) {
    submitCategoryButton.disabled = false;
    categoryInput.classList.remove('headShake');
    categoryInput.classList.remove('invalid');
    spanCategoryBorder.classList.remove('invalid');
    spanCategoryTooltip.textContent = 'Créer';

    apiErrorOccurred = false;
  }
});

// ##### Input unfocus (masquer message d'erreur + retirer classe de validation si input vide) ##### //
categoryInput.addEventListener('blur', () => {
  if (!categoryInput.validity.valid && categoryInput.value.trim() === '') {
    spanCategoryBorder.classList.remove('invalid');
    spanCategoryBorder.classList.remove('valid');
    categoryInput.classList.remove('headShake');
    categoryErrorMessage.textContent = '';
    categoryErrorMessage.classList.remove('show');
    spanCategoryTooltip.textContent = 'Saisir';
    categoryHasTyped = false;
  }
});

// ##### Soumission formulaire ##### //
categoryForm.addEventListener('submit', async (event) => {
  // Empêcher soumission classique du formulaire
  event.preventDefault();

  // Vérifier validité de l'input
  updateValidationState();

  if(isChromeExtension()) {
    // Si formulaire valide
    if (categoryInput.validity.valid) {

      // Valeur actuelle sélectionnée
      const categoryName = categoryInput.value.trim();

      if (categoryName) {
        try {
          const response = await sendMessageAsync({
            action: 'addCategory',
            categoryName: categoryName
          });

          if (response.success) {
            // Mettre à jour le select
            updateCategoriesSelectList();

            if (Notification.permission === 'granted') {
              createNotification('category');
            }
            else {
              showAlert("✔️ La catégorie a été ajoutée!");
            }

            // Reset formulaire
            categoryForm.reset();
            // Reset input (par sécurité car déjà effectué par le reset formulaire)
            updateCategoryInput.value = '';
          }
          else {
            if (Notification.permission === 'granted') {
              createNotification('unexpected-error');
            }
            else {
              showAlert("⚰️ Une erreur est survenue!");
            }
          }
        }
        catch (error) {
          handleServiceWorkerError(error);
        }
      }
    }
    else {
      console.error("You should execute this extension in a Chrome environment!");
    }
  }
});

// ########################################################### //
// ########## Formulaire modification de catégories ########## //
// ########################################################### //
const submitUpdateCategoryButton = document.getElementById('update-category-btn');
const spanUpdateCategoryBorder = document.getElementById('update-category-border-input');
const spanUpdateCategoryTooltip = document.querySelector('.update-category-tooltip');

// ##### Désactiver submit bouton ##### //
submitUpdateCategoryButton.disabled = true;

// ##### Vérifier si utilisateur a déjà saisi ##### //
let updateCategoryHasTyped = false;

// ##### État de la catégorie sélectionnée ##### //
let isUpdateCategorySelected = false;
let selectedCategoryId = null;

// ##### Vérifier si une catégorie a été sélectionnée ##### //
updateCategorySelectOptions.addEventListener('click', (event) => {
  const selectedOption = event.target;

  // Empêcher la propagation de l'événement pour ne pas soumettre le formulaire
  event.stopPropagation();

  // Maj état de sélection
  if (selectedOption.tagName.toLowerCase() === 'li' && selectedOption.dataset.value) {
    // Récupérer l'ID ou valeur de l'option
    selectedCategoryId = selectedOption.dataset.value;
    isUpdateCategorySelected = true;

    // Maj bouton de sélection
    updateCategorySelectButton.textContent = selectedOption.textContent.trim();
    updateCategorySelectContent.classList.remove('open');

    // Initialiser la valeur du tooltip + bordure
    spanUpdateCategoryTooltip.textContent = 'Modifier valeur';
    spanUpdateCategoryBorder.classList.add('invalid');

    // Désactiver bouton de soumission par défaut
    submitUpdateCategoryButton.disabled = true;

    toggleSubmitUpdateCategoryButtonState();
  }
});

// ##### Injecter les contraintes de validation ##### //
updateCategoryInput.setAttribute('required', true);
updateCategoryInput.setAttribute('minlength', 3);

// ##### Message d'erreur ##### //
const updateCategoryErrorMessage = document.createElement('span');
updateCategoryErrorMessage.id = 'update-category-error-message';
updateCategoryInputContainer.insertAdjacentElement('afterend', updateCategoryErrorMessage);

// ##### Activer / désactiver bouton soumission ##### //
const toggleSubmitUpdateCategoryButtonState = () => {
  const value = updateCategoryInput.value.trim();
  const initialInjectedValue = updateCategorySelectButton.textContent.trim();
  const isValueModified = value !== initialInjectedValue;

  submitUpdateCategoryButton.disabled = !(isUpdateCategorySelected && isValueModified && updateCategoryInput.validity.valid);
};

// ##### Comportement de validation ##### //
const updateCategoryValidationState = () => {
  const value = updateCategoryInput.value.trim();
  const initialInjectedValue = updateCategorySelectButton.textContent.trim();
  const error = validateInput(value);

  // Input visible + valeur modifiée
  const isInputVisible = updateCategoryInputContainer.style.display === 'flex';
  const isValueModified = value !== initialInjectedValue;

  // Ne valider que si input visible + valeur modifiée
  if (isInputVisible && isValueModified) {
    // Invalidité si erreur détectée
    if (error) {
      updateCategoryInput.setCustomValidity('invalid');
      spanUpdateCategoryBorder.classList.add('invalid');
      updateCategoryInput.classList.add('invalid');
      updateCategoryInput.classList.add('headShake');

      // Afficher message d'erreur
      updateCategoryErrorMessage.textContent = error;
      updateCategoryErrorMessage.classList.add('show');

      // Modifier texte tooltip
      spanUpdateCategoryTooltip.textContent = 'Saisie invalide';
    }
    else {
      updateCategoryInput.setCustomValidity('');
      spanUpdateCategoryBorder.classList.remove('invalid');
      spanUpdateCategoryBorder.classList.add('valid');
      updateCategoryInput.classList.remove('invalid');
      updateCategoryInput.classList.remove('headShake');

      // Effacer message d'erreur
      updateCategoryErrorMessage.textContent = '';
      updateCategoryErrorMessage.classList.remove('show');

      // Modifier texte tooltip
      spanUpdateCategoryTooltip.textContent = 'Modifier';
    }
  }
  else if (updateCategoryHasTyped && !isValueModified) {
    spanUpdateCategoryTooltip.textContent = 'Modifier valeur';
    updateCategoryInput.classList.add('invalid');
    updateCategoryInput.classList.add('headShake');
    spanUpdateCategoryBorder.classList.add('invalid');
  }
  else if (!isValueModified) {
    spanUpdateCategoryTooltip.textContent = 'Modifier valeur';
    spanUpdateCategoryBorder.classList.add('invalid');
  }
};

// ##### Écouter événements changements d'état de l'input ##### //
updateCategoryInput.addEventListener('input', () => {
  // MAJ état de saisie
  const value = updateCategoryInput.value.trim();
  if (value !== '') {
    updateCategoryHasTyped = true;
  }

  updateCategoryValidationState();

  // Focus + input vide + état saisie = true
  if (updateCategoryHasTyped && value === '' && document.activeElement === updateCategoryInput) {
    spanUpdateCategoryTooltip.textContent = 'Rejoues';
  }

  toggleSubmitUpdateCategoryButtonState();
});

// ##### Input unfocus (masquer message d'erreur + retirer classe de validation) ##### //
updateCategoryInput.addEventListener('blur', () => {
  if (!updateCategoryInput.validity.valid && updateCategoryInput.value.trim() === '') {
    spanUpdateCategoryBorder.classList.remove('invalid');
    spanUpdateCategoryBorder.classList.remove('valid');
    updateCategoryInput.classList.remove('headShake');
    updateCategoryErrorMessage.textContent = '';
    updateCategoryErrorMessage.classList.remove('show');
    updateCategoryHasTyped = false;
  }
});

// ##### Soumission formulaire ##### //
submitUpdateCategoryButton.addEventListener('click', async (event) => {
  // Empêcher soumission du formulaire
  event.preventDefault();
  // Empêcher propagation de l'event
  event.stopPropagation();

  // Vérifier validité de l'input
  updateCategoryValidationState();

  if(isChromeExtension()) {
    // Si formulaire valide
    if (updateCategoryInput.validity.valid) {

      // Nouvelle valeur saisie
      const newCategoryName = updateCategoryInput.value.trim();

      if (isUpdateCategorySelected && oldCategoryId && newCategoryName) {
        try {
          const response = await sendMessageAsync({
            action: 'updateCategory',
            oldCategoryId: oldCategoryId,
            newCategoryName: newCategoryName
          });

          if (response.success) {
            // MAJ select catégories
            updateCategoriesSelectList();

            if (Notification.permission === 'granted') {
              createNotification('update-category');
            }
            else {
              showAlert("✔️ La catégorie a été modifiée!");
            }

            // Masquer l'input container
            updateCategorySelectButton.textContent = 'Modifier catégorie';
            updateCategorySelectContent.classList.remove('open');
            updateCategoryInputContainer.style.display = 'none';
            sortifyContent.style.setProperty('padding-bottom', '15px');
            // Reset formulaire
            updateCategoryForm.reset();
            // Reset input (par sécurité car déjà effectué par le reset formulaire)
            updateCategoryInput.value = '';
          }
          else {
            if (Notification.permission === 'granted') {
              createNotification('unexpected-error');
            }
            else {
              showAlert("⚰️ Une erreur est survenue!");
            }
          }
        }
        catch (error) {
          handleServiceWorkerError(error);
        }
      }
    }
    else {
      console.error("You should execute this extension in a Chrome environment!");
    }
  }
});


// ####################################### //
// ########## Chargement du DOM ########## //
// ####################################### //
document.addEventListener('DOMContentLoaded', () => {
  updateCategoriesSelectList();
  addBtnBookmarkAnimations();
  addSelectUpdateCategoryAnimation();
  initializeNotificationPermissions();
  handleNotificationButtonClick();
  addCapitalizationToInputs();
});



// const bouton = document.getElementById("bookmark-btn");

// window.addEventListener("focus", () => {
//   console.log("Focus retrouvé sur la popup.");

//   if (bouton) {
//     bouton.replaceWith(bouton.cloneNode(true));
//     bouton.addEventListener("click", () => {
//       console.log("Bouton cliqué après focus!");
//     });
//     console.log("Écouteur réinitialisé après focus.");
//   }
// });
// document.addEventListener("DOMContentLoaded", () => {
//   if (bouton) {
//     bouton.addEventListener("click", () => {
//       console.log("Bouton cliqué !");
//     });
//     console.log("Écouteur ajouté avec succès !");
//   }
//   else {
//     console.error("Le bouton n'a pas été trouvé !");
//   }
// });
