document.addEventListener('DOMContentLoaded', () => {
  const domain = JITSI_DOMAIN;
  const options = {
    roomName: JITSI_ROOM,
    parentNode: document.getElementById('jitsi-container'),
    width: '100%',
    height: '100%',
    configOverwrite: { disableDeepLinking: true },
    interfaceConfigOverwrite: { SHOW_WATERMARK_FOR_GUESTS: false }
  };
  new JitsiMeetExternalAPI(domain, options);
});
