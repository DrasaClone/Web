document.addEventListener('deviceready', () => {
  // Mọi link mở trong cùng WebView
  window.open = cordova.InAppBrowser.open;

  // Cho phép chạy ngầm
  cordova.plugins.backgroundMode.enable();
  cordova.plugins.backgroundMode.on('activate', () => {
    cordova.plugins.backgroundMode.disableWebViewOptimizations();
  });
});
