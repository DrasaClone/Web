if (window.cordova) {
  document.addEventListener('deviceready', function () {
    // Override target="_blank" links
    document.addEventListener('click', function (e) {
      var anchor = e.target.closest('a[href]');
      if (anchor && anchor.getAttribute('target') === '_blank') {
        e.preventDefault();
        cordova.InAppBrowser.open(anchor.href, '_self', 'location=no');
      }
    });
    // Override window.open
    window.open = function (url) {
      return cordova.InAppBrowser.open(url, '_self', 'location=no');
    };
    // Persist URL on pause
    document.addEventListener('pause', function () {
      localStorage.setItem('lastUrl', window.location.href);
    });
    // Restore URL on resume
    document.addEventListener('resume', function () {
      var lastUrl = localStorage.getItem('lastUrl');
      if (lastUrl) window.location.href = lastUrl;
    });
    // Background mode
    cordova.plugins.backgroundMode.enable();
    cordova.plugins.backgroundMode.on('activate', function () {
      cordova.plugins.backgroundMode.disableWebViewOptimizations();
    });
    // Push notifications
    var push = PushNotification.init({ android: { senderID: "YOUR_SENDER_ID" } });
    push.on('registration', function (data) {
      console.log('Push token:', data.registrationId);
    });
    push.on('notification', function (data) {
      new Notification(data.title || 'Notification', { body: data.message });
    });
  });
}
