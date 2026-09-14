/* BSC — DB-driven collection directory.
   Fetches the seeded collections from the backend (/api/content/collections) and appends
   the "full directory" grid under the main collection cards, so every aisle — dress
   materials, jewellery, cosmetics, footwear, accessories, brands, tailoring — is on the
   page and tracked like any other section. Fails silently when the API is unreachable;
   the static cards above always remain the fallback. */
(async function () {
  'use strict';
  try {
    const r = await fetch('/api/content/collections');
    if (!r.ok) return;
    const cols = await r.json();
    const host = document.querySelector('#collections');
    if (!host || !Array.isArray(cols) || !cols.length) return;

    const dir = document.createElement('div');
    dir.className = 'dir';
    dir.setAttribute('data-section', 'directory');
    dir.innerHTML =
      '<header class="sec-head" style="margin-top:56px">' +
        '<p class="kicker">From the BSC database · live directory</p>' +
        '<h2>Every aisle, every occasion</h2>' +
        '<p class="sec-note">Served from our own catalogue database — the same data our floors run on.</p>' +
      '</header>' +
      '<div class="b-grid">' +
      cols.map((c) => {
        const slug = String(c.slug).replace(/[^a-z0-9-]/gi, '');
        const art = c.image
          ? '<img class="b-art" src="' + c.image + '" alt="" loading="lazy">'
          : '';
        return '<div class="b-tile" data-track="directory" data-el="' + slug + '" style="--acc:' + (c.accent || '#203A85') + '">' +
          art +
          '<div class="b-txt">' +
            '<b>' + String(c.name).replace(/[<>&]/g, '') + '</b>' +
            '<span>' + String(c.tagline || '').replace(/[<>&]/g, '') + '</span>' +
            '<span class="b-go">View in store →</span>' +
          '</div>' +
        '</div>';
      }).join('') +
      '</div>';
    host.appendChild(dir);
  } catch (e) { /* offline — static content already covers the essentials */ }
})();
