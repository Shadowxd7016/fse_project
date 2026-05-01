import { initHero } from '/js/hero.js';

async function loadComponent(selector, file, callback) {
  const res = await fetch(file);
  const html = await res.text();
  document.querySelector(selector).innerHTML = html;
  if (callback) callback(); // run JS after HTML is in the DOM
}

// Call on every page
loadComponent('#navbar', '/components/navbar.html');
loadComponent('#footer', '/components/footer.html');
loadComponent('#hero', '/components/hero.html', initHero);