/* The product window and feature mocks come alive only while they are on screen. */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const groups = [...document.querySelectorAll('.zk-window, .card--open > .panel.zk-feature-panel')];
  groups.forEach((group) => {
    const pause = document.createElement('button');
    pause.type = 'button';
    pause.className = 'zk-loop-pause';
    pause.textContent = 'II';
    pause.setAttribute('aria-label', 'Pause animation');
    group.appendChild(pause);
    pause.addEventListener('click', () => {
      const stopped = group.classList.toggle('is-paused');
      pause.textContent = stopped ? '>' : 'II';
      pause.setAttribute('aria-label', stopped ? 'Play animation' : 'Pause animation');
    });
  });

  if (!('IntersectionObserver' in window)) {
    groups.forEach((group) => group.classList.add('is-live'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-live', entry.isIntersecting));
  }, { threshold: .2 });
  groups.forEach((group) => observer.observe(group));
})();
