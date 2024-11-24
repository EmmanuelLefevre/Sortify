// Fonction pour créer une notification desktop personnalisée en fonction du type
const createNotification = (type) => {
  let message;
  let body;
  let icon;

  // Utilisation d'un switch pour déterminer le type de notification
  switch (type) {
    case 'success':
      message = 'Sortify';
      body = '🚀 Notifications activées!';
      icon = '../assets/logo/logo.png';
      break;
    case 'already_success':
      message = 'Sortify';
      body = '🚀 Vos notifications sont déjà activées!';
      icon = '../assets/logo/logo.png';
      break;
    case 'denied':
      message = 'Sortify';
      body = '🤬 Notifications refusées!';
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
    default:
      message = 'Sortify';
      body = '🔔 Vous avez une nouvelle notification!';
      icon = '../assets/logo/logo.png';
      break;
  }

  // Créer la notification
  new Notification(message, {
    body: body,
    icon: icon,
    vibrate: [200, 100, 200],
    silent: true,
    badge: 'src/assets/icons/success_16.png'
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
      enableNotifsButton.addEventListener('click', () => {
        // Demander la permission de notifications lors du clic
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            createNotification('success');
            updateButtonVisibility(enableNotifsButton, false);
          }
          else {
            createNotification('denied');
          }
        }).catch((err) => {
          console.error("Erreur lors de la demande des permissions : ", err);
          createNotification('error');
        });
      });
    break;
  }
};

document.getElementById('sort-btn').addEventListener('click', (event) => {
  // Demander la permission pour les notifications
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      createNotification('success');
    }
    else if (permission === 'default') {
      // demander la permission à l'utilisateur via une popup
    }
    else {
      createNotification('denied');
    }
  }).catch((error) => {
    console.error("Erreur lors de la demande de permission de notification", error);
    createNotification('error');
  });
});


// Chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log('État actuel des notifications:', Notification.permission);
  const enableNotifsButton = document.getElementById("enable-notifs");

  // Appeler la gestion des permissions de notifications
  handleNotificationPermissions(enableNotifsButton);
});


// document.getElementById('sort-btn').addEventListener('click', () => {
//   chrome.runtime.sendMessage({ action: "sortBookmarks" }, (response) => {
//     if (response.success) {
//       console.log("Favoris triés avec succès !");
//     }
//     else {
//       console.error("Échec du tri des favoris");
//       createNotification('error');
//     }
//   });
// });
