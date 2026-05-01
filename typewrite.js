
const phrases = ["Find it.", "Fix it.", "Sell it."];
const el = document.getElementById("typewriter");
let pi = 0, ci = 0, deleting = false, pause = 0;

function tick() {
  const phrase = phrases[pi];
  if (pause > 0) { pause--; setTimeout(tick, 80); return; }
  if (!deleting) {
    el.textContent = phrase.slice(0, ++ci);
    if (ci === phrase.length) { pause = 22; deleting = true; }
    setTimeout(tick, 95);
  } else {
    el.textContent = phrase.slice(0, --ci);
    if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; pause = 5; }
    setTimeout(tick, 48);
  }
}
tick();
