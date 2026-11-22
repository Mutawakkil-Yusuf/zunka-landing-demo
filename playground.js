/* Zunka playground — the page behaves like the plugin it sells.
   Select a frame, drag the flow into a new order, switch a component, export it. */
(() => {
  const windowEl = document.querySelector('.zk-window');
  const layersHost = document.querySelector('.zk-window__layers');
  const canvas = document.querySelector('.zk-window__canvas');
  const exportCard = document.querySelector('[data-export]');
  if (!windowEl || !layersHost || !canvas || !exportCard) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canAnimate = !reduce && typeof Element.prototype.animate === 'function';

  const frames = {
    a: { name: 'Onboarding', frame: '390 × 844', layout: 'Vertical', gap: '12', fill: '#E7E51E' },
    b: { name: 'Home',        frame: '390 × 844', layout: 'Grid',     gap: '8',  fill: '#F2F2F2' },
    c: { name: 'Checkout',    frame: '390 × 844', layout: 'Vertical', gap: '16', fill: '#0A0A0A' }
  };

  let order = ['a', 'b', 'c'];
  let selected = 'a';
  let exported = false;
  let suppressClick = false;
  let drag = null;
  let lastNote = 0;

  const layerList = layersHost.querySelector('.zk-layer-list') || layersHost;
  const live = document.querySelector('[data-live]');
  const layerButtons = () => [...layerList.querySelectorAll('.zk-layer')];
  const phones = () => [...canvas.querySelectorAll('.zk-phone')];
  const announce = (text) => { if (live) live.textContent = text; };
  const note = (message) => {
    const now = Date.now();
    if (now - lastNote < 2200) return;
    lastNote = now;
    document.dispatchEvent(new CustomEvent('zk:note', { detail: { message } }));
  };
  const setProp = (key, value) => {
    const el = document.querySelector(`[data-prop="${key}"]`);
    if (el) el.textContent = value;
  };

  // Animate position changes without touching `transform`, which the mock's
  // selected-state lift owns. translate is an independent CSS property.
  const flip = (items, mutate) => {
    if (!canAnimate) { mutate(); return; }
    const before = new Map(items.map((el) => [el, el.getBoundingClientRect()]));
    mutate();
    items.forEach((el) => {
      const start = before.get(el);
      if (!start) return;
      const end = el.getBoundingClientRect();
      const dx = start.left - end.left, dy = start.top - end.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.animate(
        [{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }],
        { duration: 420, easing: 'cubic-bezier(.2, .8, .2, 1)' }
      );
    });
  };

  const paintMirrors = () => {
    const names = order.map((id) => frames[id].name);
    document.querySelectorAll('[data-flow]').forEach((el, i) => { el.textContent = names[i] || ''; });
    document.querySelectorAll('.zk-export__list span').forEach((el, i) => {
      el.lastChild.textContent = ' ' + (names[i] || '');
    });
  };

  const renderDOM = () => {
    order.forEach((id) => {
      const layer = layerList.querySelector(`.zk-layer[data-screen="${id}"]`);
      const phone = canvas.querySelector(`.zk-phone[data-layer="${id}"]`);
      if (layer) layerList.appendChild(layer);
      if (phone) canvas.appendChild(phone);
    });
    paintMirrors();
  };

  const select = (id, speak = false) => {
    if (!frames[id]) return;
    selected = id;
    layerButtons().forEach((btn) => {
      const on = btn.dataset.screen === id;
      btn.classList.toggle('is-selected', on);
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    phones().forEach((p) => p.classList.toggle('is-active', p.dataset.layer === id));
    const f = frames[id];
    setProp('name', f.name);
    setProp('frame', f.frame);
    setProp('layout', f.layout);
    setProp('gap', f.gap);
    setProp('fill', f.fill);
    if (speak) announce(`${f.name} selected`);
  };

  const reorder = (from, to) => {
    if (from === to || to < 0 || to >= order.length) return;
    // Rows snap to their new place; only the canvas phones glide. Animating the
    // rows would move the hit targets under the pointer mid-drag.
    flip(phones(), () => {
      const [id] = order.splice(from, 1);
      order.splice(to, 0, id);
      renderDOM();
    });
    note('That order makes sense.');
    announce(`${frames[order[to]].name} moved to position ${to + 1} of ${order.length}`);
  };

  // Pointer drag for the mouse and touch. A click selects; a drag past the
  // threshold reorders, so the two gestures never fight over the same tap.
  layersHost.addEventListener('pointerdown', (event) => {
    const btn = event.target.closest('.zk-layer');
    if (!btn || event.button !== 0) return;
    drag = { btn, startY: event.clientY, from: order.indexOf(btn.dataset.screen), moved: false };
  });
  const onMove = (event) => {
    if (!drag) return;
    if (!drag.moved && Math.abs(event.clientY - drag.startY) < 6) return;
    drag.moved = true;
    drag.btn.classList.add('is-dragging');
    const hovered = layerButtons().find((row) => {
      if (row === drag.btn) return false;
      const box = row.getBoundingClientRect();
      return event.clientY >= box.top && event.clientY <= box.bottom;
    });
    if (!hovered) return;
    const to = order.indexOf(hovered.dataset.screen);
    if (to !== drag.from) { reorder(drag.from, to); drag.from = to; }
  };
  const onUp = () => {
    if (!drag) return;
    drag.btn.classList.remove('is-dragging');
    suppressClick = drag.moved;
    drag = null;
    setTimeout(() => { suppressClick = false; }, 0);
  };
  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerup', onUp);
  document.addEventListener('pointercancel', onUp);

  layerButtons().forEach((btn) => {
    btn.addEventListener('click', () => { if (!suppressClick) select(btn.dataset.screen, true); });
    btn.addEventListener('keydown', (event) => {
      const i = order.indexOf(btn.dataset.screen);
      if (event.key === 'ArrowUp' && i > 0) { event.preventDefault(); reorder(i, i - 1); btn.focus(); }
      if (event.key === 'ArrowDown' && i < order.length - 1) { event.preventDefault(); reorder(i, i + 1); btn.focus(); }
    });
  });

  // Component variants: the choice shows in the card and in every phone at once.
  const compPanel = document.querySelector('.zk-comp')?.closest('.zk-feature-panel');
  document.querySelectorAll('.zk-comp button[data-variant]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = Number(btn.dataset.variant);
      document.querySelectorAll('.zk-comp button[data-variant]').forEach((b) => {
        const on = b === btn;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      const preview = document.querySelector('.zk-comp__preview');
      if (preview) preview.dataset.variant = String(v);
      windowEl.dataset.variant = String(v);
      compPanel?.classList.add('is-controlled');
      note('It changed everywhere. See?');
      announce(`${btn.textContent.trim()} applied to every screen`);
    });
  });

  // Export produces a real, small artefact: a contact sheet of the current flow.
  const list = exportCard.querySelector('.zk-export__list');
  const go = exportCard.querySelector('[data-export-go]');
  const sheet = exportCard.querySelector('.zk-export__sheet');
  const file = exportCard.querySelector('.zk-export__file');
  const reset = exportCard.querySelector('.zk-export__reset');
  const thumbs = [...exportCard.querySelectorAll('.zk-export__thumbs i')];

  const contactSheet = () => {
    const names = order.map((id) => frames[id].name);
    const fills = order.map((id) => frames[id].fill);
    const cards = names.map((name, i) => `
      <g transform="translate(${32 + i * 152} 58)">
        <rect width="120" height="104" rx="10" fill="#ffffff" stroke="#d8d8d8"/>
        <rect x="8" y="8" width="104" height="60" rx="6" fill="${fills[i]}"/>
        <rect x="14" y="14" width="26" height="26" rx="6" fill="#0a0a0a" opacity=".7"/>
        <rect x="48" y="17" width="46" height="4" rx="2" fill="#0a0a0a" opacity=".35"/>
        <rect x="48" y="26" width="34" height="4" rx="2" fill="#0a0a0a" opacity=".22"/>
        <rect x="14" y="76" width="50" height="5" rx="2" fill="#0a0a0a"/>
        <rect x="14" y="86" width="78" height="4" rx="2" fill="#e4e4e4"/>
        <text x="14" y="101" font-family="monospace" font-size="9" fill="#4a4a4a">0${i + 1} ${name}</text>
      </g>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="200" viewBox="0 0 520 200">
      <rect width="520" height="200" fill="#f2f2f2"/>
      <text x="32" y="34" font-family="monospace" font-size="14" font-weight="bold" fill="#0a0a0a">ZUNKA · FLOW EXPORT</text>
      ${cards}
      <text x="32" y="188" font-family="monospace" font-size="9" fill="#8a8a8a">Demo export · zunka.example</text>
    </svg>`;
  };

  const runExport = async () => {
    if (exported) return;
    exported = true;
    const thumbScreens = {
      a: 'linear-gradient(180deg, #e7e51e 0 58%, #ffffff 58%)',
      b: 'linear-gradient(180deg, #0a0a0a 0 14%, #f2f2f2 14% 44%, #e7e51e 44% 70%, #f2f2f2 70%)',
      c: 'linear-gradient(180deg, #0a0a0a 0 14%, #f2f2f2 14% 74%, #e7e51e 74%)'
    };
    thumbs.forEach((t, i) => { t.style.background = thumbScreens[order[i]] || '#e7e51e'; });
    if (file.href.startsWith('blob:')) URL.revokeObjectURL(file.href);
    file.href = makeBlobUrl();

    const rows = [...list.children];
    if (canAnimate) {
      await Promise.all(rows.map((row, i) => row.animate(
        [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-10px)' }],
        { duration: 260, delay: i * 70, easing: 'ease-in', fill: 'forwards' }
      ).finished.catch(() => {})));
    }
    list.hidden = true;
    go.hidden = true;
    sheet.hidden = false;
    if (canAnimate) sheet.animate(
      [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
      { duration: 320, easing: 'cubic-bezier(.2, .8, .2, 1)' }
    );
    note('Three screens. One click.');
    announce('Flow exported. Download is ready.');
  };

  const resetExport = () => {
    exported = false;
    sheet.hidden = true;
    list.hidden = false;
    go.hidden = false;
    [...list.children].forEach((row) => row.getAnimations().forEach((a) => a.cancel()));
    announce('Export reset.');
  };

  const makeBlobUrl = () => URL.createObjectURL(new Blob([contactSheet()], { type: 'image/svg+xml' }));
  file.href = makeBlobUrl();

  go?.addEventListener('click', runExport);
  reset?.addEventListener('click', resetExport);

  renderDOM();
  select(selected);
})();
