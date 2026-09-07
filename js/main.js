(function () {
  'use strict';

  /* ── Lucide icons ── */
  if (window.lucide) window.lucide.createIcons();

  /* ── Active nav link ── */
  const path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href').replace(/\.html$/, '').replace(/\/$/, '') || '/';
    if (href === path || (href !== '/' && path.startsWith(href))) {
      link.classList.add('active');
    }
  });

  /* ── Sticky header ── */
  const header = document.getElementById('header');
  function updateHeader() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 60);
  }
  if (header) {
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  /* ── Smooth scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ── Mobile nav ── */
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Hero Ken Burns ── */
  const hero = document.querySelector('.hero');
  if (hero) setTimeout(() => hero.classList.add('loaded'), 100);

  /* ── Scroll reveal ── */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    reveals.forEach(el => obs.observe(el));
  }

  /* ── Animated counters ── */
  document.querySelectorAll('[data-target]').forEach(el => {
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      const target   = parseInt(el.dataset.target, 10);
      const suffix   = el.dataset.suffix || '';
      const from     = parseInt(el.dataset.from || '0', 10);
      const duration = 1800;
      const start    = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        const v = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
        el.textContent = v + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  /* ── Product search (products page) ── */
  const searchInput = document.getElementById('prod-search');
  if (searchInput) {
    const sections  = document.querySelectorAll('.prod-section[data-cat]');
    const noResults = document.getElementById('no-results');

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      let anyVisible = false;

      sections.forEach(sec => {
        const rows  = sec.querySelectorAll('tbody tr');
        const cards = sec.querySelectorAll('.prod-card');
        let secVisible = false;

        rows.forEach(row => {
          const match = !q || row.textContent.toLowerCase().includes(q);
          row.classList.toggle('search-hidden', !match);
          if (match) secVisible = true;
        });
        cards.forEach(card => {
          const match = !q || card.textContent.toLowerCase().includes(q);
          card.classList.toggle('search-hidden', !match);
          if (match) secVisible = true;
        });

        if (!q) secVisible = true;
        sec.classList.toggle('search-hidden', !secVisible && !!q);
        if (secVisible || !q) anyVisible = true;
      });

      if (noResults) noResults.classList.toggle('hidden', anyVisible || !q);
    });
  }

  /* ── Category tabs (products page) ── */
  const tabs = document.querySelectorAll('.tab[data-cat]');
  if (tabs.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.cat;
        document.querySelectorAll('.prod-section[data-cat]').forEach(sec => {
          sec.classList.toggle('search-hidden', cat !== 'all' && sec.dataset.cat !== cat);
        });
        if (searchInput) searchInput.value = '';
      });
    });
  }

  /* ── Contact form ── */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        const err   = field.closest('.form-group').querySelector('.form-err');
        const empty = !field.value.trim();
        const bad   = field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        if (empty || bad) {
          field.classList.add('error');
          if (err) { err.textContent = bad ? 'Enter a valid email' : 'This field is required'; err.style.display = 'block'; }
          valid = false;
        } else {
          field.classList.remove('error');
          if (err) err.style.display = 'none';
        }
      });
      if (!valid) return;
      const btn = form.querySelector('[type=submit]');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      fetch('https://formsubmit.co/ajax/info@smbchem.com', {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(res => {
        if (res.ok) {
          document.getElementById('form-success').style.display = 'block';
          form.reset();
        } else {
          alert('Something went wrong. Please email us directly at info@smbchem.com');
        }
      })
      .catch(() => alert('Network error. Please email us directly at info@smbchem.com'))
      .finally(() => {
        btn.textContent = 'Send Enquiry';
        btn.disabled = false;
      });
    });
    form.querySelectorAll('[required]').forEach(f => {
      f.addEventListener('input', () => {
        f.classList.remove('error');
        const err = f.closest('.form-group').querySelector('.form-err');
        if (err) err.style.display = 'none';
      });
    });
  }

  /* ── Footer year ── */
  const yr = document.getElementById('footer-year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── Footer logo — strip white background via canvas ── */
  const footerLogoImg = document.querySelector('.footer .logo img');
  if (footerLogoImg) {
    const stripWhite = () => {
      try {
        const c = document.createElement('canvas');
        c.width = footerLogoImg.naturalWidth;
        c.height = footerLogoImg.naturalHeight;
        const ctx = c.getContext('2d');
        ctx.drawImage(footerLogoImg, 0, 0);
        const id = ctx.getImageData(0, 0, c.width, c.height);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] > 230 && d[i+1] > 230 && d[i+2] > 230) d[i+3] = 0;
        }
        ctx.putImageData(id, 0, 0);
        footerLogoImg.src = c.toDataURL('image/png');
      } catch(e) {}
    };
    if (footerLogoImg.complete && footerLogoImg.naturalWidth) stripWhite();
    else footerLogoImg.addEventListener('load', stripWhite);
  }

})();
