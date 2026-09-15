/* ============================================================
   WhatsApp Floating Button — Initialization
   Reads WHATSAPP_NUMBER and WHATSAPP_MESSAGE from config,
   builds the wa.me link, and assigns it to the button.
   ============================================================ */
(function () {
  'use strict';

  function initWhatsApp() {
    var btn = document.getElementById('whatsapp-btn');
    if (!btn || typeof WHATSAPP_NUMBER === 'undefined') return;

    var encoded = encodeURIComponent(WHATSAPP_MESSAGE);
    btn.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encoded;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhatsApp);
  } else {
    initWhatsApp();
  }
})();
