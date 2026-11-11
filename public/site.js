// Shared by every page of firsthandstories.app
  // iOS-style large title: the big brand fades into the top bar over the first 90 points of scrolling
  // One logo: the large brand slides and shrinks up into the top bar, then hands over to the bar's own logo
  (() => {
    const r = document.documentElement.style, big = document.querySelector('.big-brand'), mini = document.querySelector('.mini-brand');
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let m = null, t = false;
    const measure = () => {
      if (!big || !mini) return;
      big.style.transform = ''; const y = scrollY;
      const bm = big.querySelector('.mark').getBoundingClientRect(), mm = mini.querySelector('.mark').getBoundingClientRect();
      const bx = big.getBoundingClientRect();
      m = { dx: mm.left - bm.left, top: bm.top + y, target: mm.top, s: mm.width / bm.width, ox: bm.left - bx.left, oy: bm.top - bx.top };
      m.end = Math.max(1, m.top - m.target);
    };
    const f = () => {
      t = false;
      if (!big || !m) { r.setProperty('--p', 1); r.setProperty('--mini', 1); return; }
      const p = Math.min(1, Math.max(0, scrollY / m.end)), e = p * p * (3 - 2 * p);
      const hand = p >= .97;
      r.setProperty('--p', still ? p.toFixed(3) : hand ? '1' : Math.max(0, (p - .85) / .15 * .4).toFixed(3));
      const sc = 1 + (m.s - 1) * e;
      if (!still) big.style.transform = `translate(${(m.dx * e + m.ox * (1 - sc)).toFixed(1)}px, ${(m.oy * (1 - sc)).toFixed(1)}px) scale(${sc.toFixed(4)})`;
      big.style.opacity = still ? (1 - p).toFixed(3) : (hand ? 0 : 1);
      r.setProperty('--mini', still ? p.toFixed(3) : (hand ? 1 : 0));
    };
    const go = () => { if (!t) { t = true; requestAnimationFrame(f); } };
    measure(); f();
    addEventListener('scroll', go, { passive: true });
    addEventListener('resize', () => { measure(); f(); });
    document.fonts && document.fonts.ready.then(() => { measure(); f(); });
  })();
  // Sections rise into view as they're scrolled to; skipped with Reduce Motion
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const els = document.querySelectorAll('main > section, .grid > li, .feature figure');
    els.forEach(e => e.classList.add('reveal'));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  }
  // Margin photos drift at different speeds as the page scrolls (parallax); still with Reduce Motion
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ph = [...document.querySelectorAll('.margin-photos img')];
    let ticking = false;
    const move = () => { const mid = scrollY + innerHeight / 2; ph.forEach(i => { const home = i.offsetTop + i.offsetHeight / 2; i.style.setProperty('--y', ((home - mid) * i.dataset.speed).toFixed(1) + 'px'); }); ticking = false; };
    addEventListener('resize', move);
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
    move();
  }

  // Tuning (#233): [ and ] soften or strengthen the photos in steps of 5%, 0 resets; the value shows bottom left and is kept in this browser.
  // Try levels, then tell Claude the number to make it the default (--photo in site.css).
  (() => {
    const r = document.documentElement.style, key = 'tune-photo';
    let v = null, badge = null, hide = 0;
    try { v = parseFloat(localStorage.getItem(key)); } catch (e) {}
    if (v > 0) r.setProperty('--photo', v);
    addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
      if (!['[', ']', '0'].includes(e.key)) return;
      const base = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--photo')) || .5;
      if (e.key === '0') { r.removeProperty('--photo'); try { localStorage.removeItem(key); } catch (x) {} }
      else { v = Math.min(1, Math.max(.2, Math.round((base + (e.key === ']' ? .05 : -.05)) * 100) / 100)); r.setProperty('--photo', v); try { localStorage.setItem(key, v); } catch (x) {} }
      if (!badge) { badge = document.createElement('div'); badge.className = 'tune-badge'; badge.setAttribute('role', 'status'); document.body.append(badge); }
      const now = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--photo'));
      badge.textContent = 'Photos ' + Math.round(now * 100) + '%  ([ softer, ] stronger, 0 reset)';
      badge.hidden = false; clearTimeout(hide); hide = setTimeout(() => badge.hidden = true, 4000);
    });
  })();
