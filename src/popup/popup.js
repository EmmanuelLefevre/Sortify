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
  return typeof chrome !== 'undefined' && typeof chrome.tabs !== 'undefined';
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

    case 'category':
      message = 'Sortify';
      body = '✔️ La catégorie a été ajoutée!';
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
      body = '❓ Erreur http inconnue!';
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

    case 'chrome':
      message = 'Sortify';
      body = '🛜 API Chrome non disponible!';
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
    showAlertOnce("unsupported_notifications", "💀💀💀 Les notifications ne sont pas supportées par ce navigateur!");
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

  if (!notifsButton) {
    console.error("Element with ID 'enable-notifs' was not found in the DOM.");
    return;
  }
  if (!notifsContainer) {
    console.error("Element with class 'notifs-border-container' was not found in the DOM.");
    return;
  }

  notifsButton.addEventListener('click', async (_event) => {
    try {
      if (isChromeExtension()) {
        // Ouvrir onglet paramètres de notifications de Chrome
        chrome.tabs.create({url:'chrome://settings/content/notifications'});
      }
      else {
        console.error("API Chrome not supported!");
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

// ############################################################################ //
// ########## Fonctions utilitaires formulaires Background/Validation/Error ########## //
// ############################################################################ //
// ##### Fonction asynchrone pour envoyer l'action à effectuer dans background.js ##### //
async function sendMessageAsync(requestData) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(requestData , function(response) {

      // console.log('Response in popup.js from handleApiError() in background.js:', response);

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
function handleServiceWorkerError(error) {
  // Accéder directement à l'objet error (propriété 'error' ou objet entier)
  const errorType = error.error || error;

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

    default:
      displayServiceWorkerError('unexpected-error', "⚰️ Une erreur est survenue!");
      break;
  }
}

// ########################################################### //
// ########## Charger les catégories dans le select ########## //
// ########################################################### //
const updateCategoryForm = document.getElementById('update-category-form');
const updateCategoryInput = document.getElementById('update-category-input');
const updateCategoriesSelect = document.getElementById('update-categories-select');

async function updateCategoriesSelectList() {
  if(isChromeExtension()) {
    try {
      const response = await sendMessageAsync({ action: 'loadCategories' });

      // Vider et remplir le select
      updateCategoriesSelect.innerHTML = '';
      response.data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        updateCategoriesSelect.appendChild(option);
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
// ##### Afficher l'input du select au focus ##### //
const selectUpdateCategory = document.getElementById('update-category-select');
const updateCategoryInputContainer = document.querySelector('.update-category-input-container');
const updateCategoryInputContent = document.querySelector('.update-category-input-content');

document.addEventListener('DOMContentLoaded', () => {
  updateCategoryInputContainer.style.display = 'none';
});

selectUpdateCategory.addEventListener('focus', () => {
  updateCategoryInputContainer.style.display = 'flex';
});

// ##### Cacher input au blur si valeur du select = false ##### //
selectUpdateCategory.addEventListener('blur', () => {
  if (!selectUpdateCategory.value) {
    updateCategoryInputContainer.style.display = 'none';
  }
});

// ##### Afficher input si valeur du select = true ##### //
selectUpdateCategory.addEventListener('change', () => {
  if (selectUpdateCategory.value) {
    updateCategoryInputContainer.style.display = 'flex';
  }
});

// ##### Dropdown select options ##### //
document.getElementById('update-category-select').addEventListener('click', function () {
  const updateCategoryInputContent = this.parentElement;
  updateCategoryInputContent.classList.toggle('open');
});

// ##### Ajouter classe qui affiche la liste déroulante lorsque le conteneur a la classe .open ##### //
// document.getElementById('update-category-select').addEventListener('click', function () {
//   const updateCategorySelectContainer = this.parentElement;
//   updateCategorySelectContainer.classList.toggle('open');

//   // Basculer l'affichage de la liste
//   const optionsList = document.getElementById('update-category-select-options');
//   if (updateCategorySelectContainer.classList.contains('open')) {
//     optionsList.style.display = 'block';
//   }
//   else {
//     optionsList.style.display = 'none';
//   }
// });

// ##### Amélioration => fermer la liste si user click en dehors du menu ##### //
// document.addEventListener('click', function (event) {
//   const container = document.querySelector('.update-category-select-container');
//   if (!container.contains(event.target)) {
//     container.classList.remove('open');
//     document.getElementById('update-category-select-options').style.display = 'none';
//   }
// });

// ##### Fermer dropdown si une value est sélectionnée ##### //

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

      // Ajouter logique pour créer le dossier (sauf si déjà existant) et ajouter le favori dans le dossier avec pour valeur le nom du site (=> fonction split url et récupérer "google" dans google.com, pas de http:// et .com/.fr...)

      // Puis notifs ou alert
      if (Notification.permission === 'granted') {
        createNotification('bookmark');
      }
      else {
        showAlert("✔️ Le favori a été ajouté!");
      }
      // console.log('Bookmark added:', response.data);
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
const toggleSubmitButtonState = () => {
  submitCategoryButton.disabled = !categoryInput.validity.valid;
};

// ##### Comportement de validation ##### //
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

  toggleSubmitButtonState();
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

          // Traiter la réponse de background.js (notif / alert / success message )
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
        catch (error) {
          handleServiceWorkerError(error);
        }
      }
    }
  }
});

// ########################################################### //
// ########## Formulaire modification de catégories ########## //
// ########################################################### //
// ##### Désactiver submit bouton ##### //
// ##### Vérifier si utilisateur a déjà saisi ##### //
let categoriesHasTyped = false;
// ##### Injecter les contraintes de validation ##### //
// ##### Message d'erreur ##### //
// ##### Activer / désactiver bouton soumission ##### //
// ##### Comportement de validation ##### //

// ##### Soumission formulaire ##### //
updateCategoryForm.addEventListener('submit', async (event) => {
  // Empêcher soumission classique du formulaire
  event.preventDefault();

  // Vérifier validité de l'input
  // updateValidationState();

  if(isChromeExtension()) {
    // Si formulaire valide
    if (updateCategoryInput.validity.valid) {

      // Valeur actuelle sélectionnée (ID)
      const oldCategoryId = updateCategoriesSelect.value;
      // Nouvelle valeur saisie
      const newCategoryName = updateCategoryInput.value.trim();

      if (oldCategoryId && newCategoryName) {
        try {
          const response = await sendMessageAsync({
            action: 'updateCategory',
            oldCategoryId: oldCategoryId,
            newCategoryName: newCategoryName
          });

          // MAJ select catégories
          updateCategoriesSelectList();

          if (Notification.permission === 'granted') {
            createNotification('update-category');
          }
          else {
            showAlert("✔️ La catégorie a été modifiée!");
          }

          // Reset formulaire
          updateCategoryForm.reset();
          // Reset input (par sécurité car déjà effectué par le reset formulaire)
          updateCategoryInput.value = '';
        }
        catch (error) {
          handleServiceWorkerError(error);
        }
      }
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
  toggleSubmitButtonState();
});
