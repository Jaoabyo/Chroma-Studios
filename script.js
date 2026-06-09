// ===== MINI PLAYER SOUNDCLOUD =====
(function () {
  const iframe    = document.getElementById('sc-widget');
  const playBtn   = document.getElementById('miniPlayBtn');
  const skipBtn   = document.getElementById('miniSkipBtn');
  const prevBtn   = document.getElementById('miniPrevBtn');
  const disco     = document.getElementById('miniDisco');
  const aoVivo    = document.getElementById('miniAoVivo');
  const iconPlay  = playBtn ? playBtn.querySelector('.icon-play')  : null;
  const iconPause = playBtn ? playBtn.querySelector('.icon-pause') : null;
  if (!iframe || !playBtn) return;

  let widget      = null;
  let playing     = false;
  let pronto      = false;
  let pendingPlay = false; // usuário interagiu antes do widget ficar pronto

  function setPlaying(val) {
    playing = val;
    if (iconPlay)  iconPlay.style.display  = val ? 'none' : '';
    if (iconPause) iconPause.style.display = val ? '' : 'none';
    if (disco)     disco.classList.toggle('girando', val);
  }

  function removerGestos() {
    document.removeEventListener('click',       onGesto);
    document.removeEventListener('touchstart',  onGesto);
    document.removeEventListener('pointerdown', onGesto);
    document.removeEventListener('keydown',     onGesto);
  }

  function desbloquearAudio() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      setTimeout(function() { ctx.close(); }, 500);
    } catch(e) {}
  }

  function onGesto() {
    desbloquearAudio(); // desbloqueia AudioContext do iOS no gesto
    if (playing)  { removerGestos(); return; }
    if (!pronto)  return; // mantém listener ativo até widget estar pronto
    widget.play();
    removerGestos();
  }

  function init() {
    widget = SC.Widget(iframe);

    widget.bind(SC.Widget.Events.READY, function () {
      pronto = true;
      widget.setVolume(20);
      // Tenta autoplay direto (funciona em visitas repetidas)
      try { widget.play(); } catch(e) {}
      // Sorteia música aleatória
      widget.getSounds(function(sounds) {
        if (sounds && sounds.length > 0) {
          const idx = Math.floor(Math.random() * sounds.length);
          widget.skip(idx);
          if (!playing) try { widget.play(); } catch(e) {}
        }
      });
    });

    widget.bind(SC.Widget.Events.PLAY, function () {
      setPlaying(true);
      widget.getCurrentSound(function(sound) {
        const el = document.getElementById('miniTrackName');
        if (el && sound && sound.title) el.textContent = sound.title;
      });
    });

    widget.bind(SC.Widget.Events.PAUSE,  function () { setPlaying(false); });
    widget.bind(SC.Widget.Events.FINISH, function () { setPlaying(false); });
  }

  // Botões
  playBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!pronto) return;
    if (playing) { widget.pause(); } else { widget.play(); }
  });

  if (skipBtn) skipBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (pronto) widget.next();
  });

  if (prevBtn) prevBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (pronto && !playing) widget.play();
    else if (pronto) widget.prev();
  });

  if (aoVivo) aoVivo.addEventListener('click', function(e) {
    e.stopPropagation();
    if (pronto && !playing) widget.play();
  });

  // Toggle recolher/expandir
  const toggleBtn = document.getElementById('miniToggle');
  const player    = document.getElementById('miniPlayer');
  if (toggleBtn && player) {
    if (window.innerWidth <= 480) player.classList.add('recolhido');
    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      player.classList.toggle('recolhido');
    });
    player.addEventListener('click', function() {
      if (player.classList.contains('recolhido')) player.classList.remove('recolhido');
    });
  }

  // Gestos para autoplay — captura mesmo antes do widget estar pronto
  document.addEventListener('click',       onGesto, { passive: true });
  document.addEventListener('touchstart',  onGesto, { passive: true });
  document.addEventListener('pointerdown', onGesto, { passive: true });
  document.addEventListener('keydown',     onGesto, { passive: true });

  if (typeof SC !== 'undefined') {
    init();
  } else {
    const s = document.createElement('script');
    s.src = 'https://w.soundcloud.com/player/api.js';
    s.onload = init;
    document.head.appendChild(s);
  }
}());

// iOS autoplay fix
(function () {
  const video = document.querySelector('.hero-parallax video');
  if (!video) return;

  function tentarPlay() {
    video.muted = true;
    video.play().catch(() => {});
  }

  video.addEventListener('canplay', tentarPlay, { once: true });

  document.addEventListener('touchstart', tentarPlay, { once: true, passive: true });
  document.addEventListener('touchend',   tentarPlay, { once: true, passive: true });
  document.addEventListener('scroll',     tentarPlay, { once: true, passive: true });

  tentarPlay();
}());

// ===== COOKIES =====
(function () {
  const banner  = document.getElementById('cookieBanner');
  const aceitar = document.getElementById('cookieAceitar');
  const recusar = document.getElementById('cookieRecusar');
  if (!banner) return;

  if (localStorage.getItem('cookie-consent')) return;

  setTimeout(() => banner.classList.add('visivel'), 1500);

  aceitar.addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'aceito');
    banner.classList.remove('visivel');
  });

  recusar.addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'recusado');
    banner.classList.remove('visivel');
  });
}());

// Remove o transform da navbar após a animação de entrada para não bloquear o menu mobile
const navbar   = document.getElementById('navbar');
navbar.addEventListener('animationend', () => {
  navbar.style.animation = 'none';
  navbar.style.transform = 'none';
  navbar.style.opacity   = '1';
}, { once: true });
const toggle   = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const links    = navLinks.querySelectorAll('a');
const heroBg   = document.getElementById('heroBg');

// Escurece navbar ao rolar
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  parallax();
});

// Parallax suave no banner
function parallax() {
  if (!heroBg) return;
  const offset = window.scrollY * 0.4;
  heroBg.style.transform = `translateY(${offset}px)`;
}

// Menu mobile
toggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = toggle.querySelectorAll('span');
  const isOpen = navLinks.classList.contains('open');
  spans[0].style.transform = isOpen ? 'translateY(7px) rotate(45deg)'  : '';
  spans[1].style.opacity   = isOpen ? '0' : '1';
  spans[2].style.transform = isOpen ? 'translateY(-7px) rotate(-45deg)' : '';
});

links.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.querySelectorAll('span').forEach(s => {
      s.style.transform = '';
      s.style.opacity   = '1';
    });
  });
});

// Link ativo por seção visível
const sections = document.querySelectorAll('section[id]');
if (sections.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = navLinks.querySelector(`a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
}


// ===== FLIP DOS CARDS =====
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });

  // acessibilidade: Enter/Space também vira o card
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.classList.toggle('flipped');
    }
  });

  // impede que clique no botão vire o card de volta
  card.querySelectorAll('.btn-card').forEach(btn => {
    btn.addEventListener('click', e => e.stopPropagation());
  });
});


// ===== SCROLL REVEAL =====
const revelaveis = document.querySelectorAll('[data-reveal]');

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visivel');
      revealObs.unobserve(entry.target); // anima só uma vez
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -60px 0px'
});

revelaveis.forEach(el => revealObs.observe(el));


// ===== FOOTER REVEAL =====
const footer = document.querySelector('.footer');
if (footer) {
  const footerObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        footer.classList.add('visivel');
        footerObs.unobserve(footer);
      }
    });
  }, { threshold: 0.1 });
  footerObs.observe(footer);
}


// ===== ULTIMATE PACK REVEAL =====
document.querySelectorAll('.ultimate-img-wrap, .ultimate-info').forEach(el => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visivel');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  obs.observe(el);
});











// ===== TÍTULO QUEM SOMOS — sticky suave com lerp + fade de saída =====
(function () {
  const secao  = document.querySelector('.quem-somos');
  const titulo = document.querySelector('.quem-somos-titulo');
  if (!secao || !titulo) return;

  const NAV   = 70;
  let current = 0;
  let target  = 0;
  let pronto  = false;

  titulo.addEventListener('transitionend', () => { pronto = true; }, { once: true });

  function loop() {
    if (pronto) {
      const secRect   = secao.getBoundingClientRect();
      const vh        = window.innerHeight;
      const titH      = titulo.offsetHeight || 150;
      const exitStart = NAV + titH + 240;
      const exitEnd   = NAV + titH + 40;

      if (secRect.bottom < exitEnd) {
        // Fora da seção — esconde imediatamente
        current = 0;
        titulo.style.transform = 'translateY(0)';
        titulo.style.opacity   = '0';
      } else if (secRect.bottom < exitStart) {
        // Zona de saída — fade out suave
        const alpha = (secRect.bottom - exitEnd) / (exitStart - exitEnd);
        titulo.style.opacity = Math.max(0, alpha).toFixed(3);

        target  = 0;
        current += (target - current) * 0.1;
        titulo.style.transform = 'translateY(' + current.toFixed(2) + 'px)';
      } else {
        // Dentro da seção — comportamento normal
        titulo.style.opacity = '1';

        if (secRect.top > vh) {
          target = 0;
        } else {
          const centroAlvo = (vh / 2) - (titH / 2);
          const offsetMax  = Math.max(0, centroAlvo - NAV) * 0.20;
          const progress   = Math.min(1, Math.max(0, -secRect.top / 800));
          const ease       = 1 - Math.pow(1 - progress, 3);
          target = offsetMax * ease;
        }

        current += (target - current) * 0.07;
        if (Math.abs(target - current) < 0.1) current = target;
        titulo.style.transform = 'translateY(' + current.toFixed(2) + 'px)';
      }
    }

    requestAnimationFrame(loop);
  }

  loop();
}());

// ===== TÍTULO NOSSAS PRODUÇÕES — sticky suave com lerp + fade de saída =====
(function () {
  const secao  = document.querySelector('.producoes');
  const titulo = document.querySelector('.producoes-titulo');
  if (!secao || !titulo) return;

  const NAV   = 70;
  let current = 0;
  let target  = 0;
  let pronto  = false;

  titulo.addEventListener('transitionend', () => { pronto = true; }, { once: true });

  function loop() {
    if (pronto) {
      const secRect   = secao.getBoundingClientRect();
      const vh        = window.innerHeight;
      const titH      = titulo.offsetHeight || 150;
      const exitStart = NAV + titH + 240;
      const exitEnd   = NAV + titH + 40;

      if (secRect.bottom < exitEnd) {
        current = 0;
        titulo.style.transform = 'translateY(0)';
        titulo.style.opacity   = '0';
      } else if (secRect.bottom < exitStart) {
        const alpha = (secRect.bottom - exitEnd) / (exitStart - exitEnd);
        titulo.style.opacity = Math.max(0, alpha).toFixed(3);

        target  = 0;
        current += (target - current) * 0.1;
        titulo.style.transform = 'translateY(' + current.toFixed(2) + 'px)';
      } else {
        titulo.style.opacity = '1';

        if (secRect.top > vh) {
          target = 0;
        } else {
          const centroAlvo = (vh / 2) - (titH / 2);
          const offsetMax  = Math.max(0, centroAlvo - NAV) * 0.20;
          const progress   = Math.min(1, Math.max(0, -secRect.top / 800));
          const ease       = 1 - Math.pow(1 - progress, 3);
          target = offsetMax * ease;
        }

        current += (target - current) * 0.07;
        if (Math.abs(target - current) < 0.1) current = target;
        titulo.style.transform = 'translateY(' + current.toFixed(2) + 'px)';
      }
    }

    requestAnimationFrame(loop);
  }

  loop();
}());


// ===== LAZY LOAD SKETCHFAB =====
(function () {
  const iframe = document.querySelector('.ouca-3d-iframe[data-src]');
  if (!iframe) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      iframe.src = iframe.dataset.src;
      delete iframe.dataset.src;
      obs.disconnect();
    });
  }, { rootMargin: '300px 0px' });
  obs.observe(iframe);
}());

// ===== LAZY LOAD VÍDEOS DOS CARDS =====
(function () {
  const videos = document.querySelectorAll('.card-video');
  if (!videos.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const video = entry.target;
      const source = video.querySelector('source[data-src]');
      if (!source) return;
      source.src = source.dataset.src;
      delete source.dataset.src;
      video.load();
      video.play().catch(() => {});
      obs.unobserve(video);
    });
  }, { rootMargin: '200px 0px' }); // começa a carregar 200px antes de aparecer

  videos.forEach(v => obs.observe(v));
}());

// ===== REVEAL DOS CARDS =====
document.querySelectorAll('.card').forEach((card, i) => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visivel');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  obs.observe(card);
});


