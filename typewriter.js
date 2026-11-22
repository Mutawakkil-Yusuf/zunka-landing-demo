/* The headline's last word rotates slowly through the people who use Zunka. */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const word = () => document.querySelector('.zk-typed__word');
  if (!word()) return;

  const words = ['teams', 'designers', 'developers', 'founders', 'creators', 'builders', 'studios'];
  let index = 0;
  let timer = null;
  let started = false;

  const type = (text) => {
    let n = 0;
    timer = setInterval(() => {
      n += 1;
      if (word()) word().textContent = text.slice(0, n);
      if (n >= text.length) { clearInterval(timer); timer = setTimeout(erase, 4200); }
    }, 90);
  };
  const erase = () => {
    let n = word()?.textContent.length || 0;
    timer = setInterval(() => {
      n -= 1;
      if (word()) word().textContent = (word()?.textContent || '').slice(0, n);
      if (n <= 0) {
        clearInterval(timer);
        index = (index + 1) % words.length;
        timer = setTimeout(() => type(words[index]), 900);
      }
    }, 60);
  };

  const start = () => { if (started) return; started = true; timer = setTimeout(erase, 2200); };
  document.addEventListener('zk:revealed', start, { once: true });
  setTimeout(start, 2000);
})();
