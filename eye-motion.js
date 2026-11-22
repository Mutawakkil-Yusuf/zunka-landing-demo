/* Zunka eyes + companion. One loop, transform-only, no dependencies. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mascot = document.querySelector('.zk-mascot');
  if (reduce) { if (mascot) mascot.style.display = 'none'; return; }

  const logoHosts = [...document.querySelectorAll('.zk-mark')];
  const headlineEyes = [...document.querySelectorAll('.zk-emoji--eyes')];
  const mascotPupils = [...document.querySelectorAll('.zk-mascot__pupil')];
  const bubble = document.querySelector('.zk-mascot__bubble');
  const sceneCard = document.querySelector('.zk-hero-3d__card');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  let scanX = 0, scanTargetX = 0, scanDir = 1, scanStep = 0, scanTimer = null, overrideUntil = 0;
  let glance = 0, glanceTarget = 0, spin = 0;
  let scrollTimer = null, blinkTimer = null, speakTimer = null;

  const paint = () => {
    logoHosts.forEach((h) => {
      h.style.setProperty('--zk-pupil-x', (curX * .55).toFixed(2) + 'px');
      h.style.setProperty('--zk-pupil-y', (curY * .55 + glance * .4).toFixed(2) + 'px');
    });
    headlineEyes.forEach((e) => {
      e.style.setProperty('--eye-x', ((curX + scanX) * .85).toFixed(2) + 'px');
      e.style.setProperty('--eye-y', (curY * .7 + glance * .5).toFixed(2) + 'px');
    });
    mascotPupils.forEach((p, i) => {
      const rest = i ? -1.4 : 1.4;
      p.style.transform = `translate(${(curX * 1.8 + rest).toFixed(2)}px, ${(curY * 1.6 + glance).toFixed(2)}px)`;
    });
    spin *= .92;
    if (sceneCard) {
      sceneCard.style.setProperty('--sc-y', (curX / 5 * 14).toFixed(2) + 'deg');
      sceneCard.style.setProperty('--sc-x', (-curY / 3 * 9).toFixed(2) + 'deg');
      sceneCard.style.setProperty('--sc-spin', spin.toFixed(2) + 'deg');
    }
  };

  const frame = () => {
    curX += (targetX - curX) * .12;
    curY += (targetY - curY) * .12;
    scanX += (scanTargetX - scanX) * .16;
    glance += (glanceTarget - glance) * .15;
    paint();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  const point = (x, y) => {
    targetX = clamp((x / innerWidth - .5) * 2, -1, 1) * 5;
    targetY = clamp((y / innerHeight - .5) * 2, -1, 1) * 3;
    overrideUntil = Date.now() + 1200;
    scanTargetX = 0;
  };
  addEventListener('pointermove', (e) => point(e.clientX, e.clientY), { passive: true });
  addEventListener('touchmove', (e) => {
    if (e.touches[0]) point(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  const blink = (short = false) => {
    const closed = short ? '.12' : '.06';
    logoHosts.forEach((h) => h.style.setProperty('--zk-lid', closed));
    headlineEyes.forEach((e) => e.style.setProperty('--eye-lid', closed));
    mascot?.style.setProperty('--m-lid-l', closed);
    mascot?.style.setProperty('--m-lid-r', closed);
    setTimeout(() => {
      logoHosts.forEach((h) => h.style.setProperty('--zk-lid', '1'));
      headlineEyes.forEach((e) => e.style.setProperty('--eye-lid', '1'));
      mascot?.style.setProperty('--m-lid-l', '1');
      mascot?.style.setProperty('--m-lid-r', '1');
    }, short ? 90 : 130);
  };

  // The headline eye also lives on its own: a quick left/right scan about every two seconds.
  const scanSteps = [
    () => { scanTargetX = scanDir * 4; return 420; },
    () => { blink(); scanTargetX = -scanDir * 4; return 420; },
    () => { scanTargetX = 0; scanDir *= -1; return 900 + Math.random() * 300; }
  ];
  const nextScan = () => {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(() => {
      if (Date.now() < overrideUntil) { nextScan(); return; }
      const delay = scanSteps[scanStep % scanSteps.length]();
      scanStep += 1;
      scanTimer = setTimeout(nextScan, delay);
    }, 180);
  };
  setTimeout(nextScan, 900);

  const bounce = () => {
    mascot?.style.setProperty('--m-scale', '1.1');
    setTimeout(() => mascot?.style.setProperty('--m-scale', '1'), 180);
  };

  const say = (message) => {
    if (!bubble) return;
    bubble.textContent = message;
    mascot?.classList.add('is-speaking');
    clearTimeout(speakTimer);
    speakTimer = setTimeout(() => mascot?.classList.remove('is-speaking'), 1900);
  };

  let lastY = scrollY;
  addEventListener('scroll', () => {
    const delta = scrollY - lastY;
    lastY = scrollY;
    glanceTarget = clamp(delta / 12, -2, 2);
    mascot?.style.setProperty('--m-tilt', clamp(delta / 20, -4, 4).toFixed(1) + 'deg');
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      glanceTarget = 0;
      mascot?.style.setProperty('--m-tilt', '0deg');
    }, 280);
  }, { passive: true });

  addEventListener('pointerdown', (event) => {
    if (mascot?.contains(event.target)) return;
    blink(true); bounce(); spin += 8;
  }, { passive: true });
  addEventListener('keydown', () => blink(), { passive: true });

  document.querySelectorAll('.btn, button[type="submit"]').forEach((el) => {
    el.addEventListener('click', () => {
      const label = (el.textContent || '').trim().toLowerCase();
      if (label.includes('figma')) say('Let’s go.');
      else if (label.includes('sign up')) say('Nice choice.');
      else if (label.includes('access')) say('On it.');
      else say('Got it.');
      blink();
    });
  });

  document.querySelectorAll('form.form').forEach((form) => {
    form.addEventListener('submit', () => {
      say(form.querySelector('[aria-invalid="true"]') ? 'Check the fields.' : 'On it.');
    });
  });

  // Tap the companion: one dry, observational line. No expressions, just a blink.
  const lines = [
    'You have been here a while.', 'I saw that click.', 'No rush. I will wait.',
    'That is the third time.', 'I keep count.', 'Almost there.',
    'You came back.', 'I like this part.', 'Still with me.',
    'Take your time.', 'That was quick.', 'Nice one.',
    'I noticed.', 'We are nearly done.', 'I will keep watch.'
  ];

  const meet = () => {
    say(lines[Math.floor(Math.random() * lines.length)]);
    blink(true);
    bounce();
  };

  mascot?.addEventListener('click', meet);
  mascot?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); meet(); }
  });

  const footer = document.querySelector('footer.closing');
  if (footer && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => mascot?.classList.toggle('is-dim', entry.isIntersecting));
    }, { threshold: .15 }).observe(footer);
  }

  const scheduleBlink = () => {
    blinkTimer = setTimeout(() => { blink(); scheduleBlink(); }, 4000 + Math.random() * 3000);
  };
  scheduleBlink();
})();
