/* The product window and feature mocks come alive only while they are on screen. */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const groups = [...document.querySelectorAll('.zk-window, .card--open > .panel.zk-feature-panel')];

  if (!('IntersectionObserver' in window)) {
    groups.forEach((group) => group.classList.add('is-live'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-live', entry.isIntersecting));
  }, { threshold: .2 });
  groups.forEach((group) => observer.observe(group));
})();
