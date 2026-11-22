/* Zunka — supporting motion. The kit owns the headline entrance; GSAP handles the
   logo, plane and band so the whole first screen arrives as one sequence. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (window.gsap && !reduce) {
    const heroReveal = () => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out', immediateRender: false } });
      tl.from('.nav .zk-mark', { scale: .4, rotate: -16, duration: .62 }, 0)
        .from('.nav .zk-logo > span:last-child', { x: -8, duration: .58 }, .10)
        .from('.zk-line', { y: 22, opacity: 0, duration: .9, stagger: .18 }, 0)
        .from('.hero__lead', { y: 14, opacity: 0, duration: .7 }, .95)
        .from('.hero--zunka .btn', { y: 10, opacity: 0, duration: .6, stagger: .12 }, 1.2)
        .from('.zk-plane', { x: 18, opacity: 0, duration: .7 }, 1.6)
        .from('.zk-band', { clipPath: 'inset(100% 0 0 0)', duration: .8 }, 1.8)
        .from('.zk-tile', { scale: .86, y: 8, duration: .56, stagger: .06, ease: 'back.out(1.7)' }, 2.05)
        .set('.zk-band', { clearProps: 'clipPath' });
    };
    document.addEventListener('zk:revealed', heroReveal, { once: true });
  }

  // Layer row -> matching phone in the product mock.
  const rows = document.querySelectorAll('.zk-window__layers [data-screen]');
  rows.forEach((row) => {
    const phone = document.querySelector(`.zk-phone[data-layer="${row.dataset.screen}"]`);
    const on = () => { row.classList.add('is-active'); phone?.classList.add('is-active'); };
    const off = () => { row.classList.remove('is-active'); phone?.classList.remove('is-active'); };
    row.addEventListener('mouseenter', on);
    row.addEventListener('mouseleave', off);
  });

  // Tap equivalents: the same details fire on touch, where hover never happens.
  const tapTargets = '.zk-logo, .nav__link, #hero-h, .hero--zunka, .zk-band, .zk-tile, .card--open, .zk-step, .zk-price-panel, footer.closing';
  document.querySelectorAll(tapTargets).forEach((el) => {
    el.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'touch') return;
      el.classList.add('is-tapped');
      setTimeout(() => el.classList.remove('is-tapped'), 520);
    });
  });

  // A tap on a layer row lights the matching phone for a moment.
  rows.forEach((row) => {
    const phone = document.querySelector(`.zk-phone[data-layer="${row.dataset.screen}"]`);
    row.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'touch') return;
      row.classList.add('is-active');
      phone?.classList.add('is-active');
      setTimeout(() => { row.classList.remove('is-active'); phone?.classList.remove('is-active'); }, 700);
    });
  });

  // No curtain: the hero reveal starts straight away.
  if (!document.querySelector('.zk-intro')) {
    setTimeout(() => document.dispatchEvent(new CustomEvent('zk:revealed')), 0);
  }

  // Let CSS shake the fields the validator marked as invalid.
  document.querySelectorAll('form.form').forEach((form) => {
    form.addEventListener('submit', () => {
      setTimeout(() => {
        if (!form.querySelector('[aria-invalid="true"]')) return;
        form.classList.add('is-invalid');
        setTimeout(() => form.classList.remove('is-invalid'), 420);
      }, 0);
    });
  });
})();
