// Chargement de l'extension
document.addEventListener('DOMContentLoaded', () => {
  // Vérifer si le navigateur prend en charge les notifications
  if (!("Notification" in window)) {
    alert("Ce navigateur ne prend pas en charge les notifications de bureau!");
  }
  // Vérifier l'état des permissions de notifications
  else if (Notification.permission === "granted") {
    new Notification('Test',{
      body : '🚀🚀🚀 Notifications déjà activées! 🚀🚀🚀'
    });
  }
  // Si la permission n'est pas encore déterminée, demander à l'utilisateur
  else if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification('Test', {
          body: '🚀🚀🚀 Notifications activées! 🚀🚀🚀'
        });
      }
      else {
        new Notification('Test', {
          body: '🤬🤬🤬 Notifications refusées! 🤬🤬🤬'
        });
      }
    }).catch((err) => {
      new Notification('Test', {
        body: '⚠️ Erreur lors de la demande des permissions! ⚠️'
      });
      console.error("Erreur lors de la demande des permissions : ", err);
    });
  }
  // Spamming
  else if (Notification.permission === "denied") {
    alert("Veuillez activer les notifications dans les paramètres du navigateur svp!");
  }
});


document.getElementById('sort-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "sortBookmarks" }, (response) => {
    if (response.success) {
      console.log("Favoris triés avec succès !");
    }
  });
});
