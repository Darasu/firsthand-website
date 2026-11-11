// Shared by every page of firsthandstories.app
  // iOS-style large title: the big brand fades into the top bar over the first 90 points of scrolling
  (() => { const r = document.documentElement.style; let t = false;
    const big = document.querySelector('.big-brand');
    const f = () => { r.setProperty('--p', big ? Math.min(1, Math.max(0, scrollY / 90)).toFixed(3) : 1); t = false; };
    addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(f); } }, { passive: true }); f(); })();
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
