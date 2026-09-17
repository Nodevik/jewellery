(() => {
  const story = document.querySelector('.story-scroll');
  const heroVideo = document.querySelector('#hero-film');
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frame = null;
  let smoothProgress = 0;

  function renderStory() {
    if (!story || !heroVideo) return;
    const rect = story.getBoundingClientRect();
    const range = Math.max(story.offsetHeight - window.innerHeight, 1);
    const target = Math.min(1, Math.max(0, -rect.top / range));
    smoothProgress += (target - smoothProgress) * (reducedMotion ? 1 : 0.085);
    story.style.setProperty('--story-progress', smoothProgress.toFixed(4));
    const duration = Number.isFinite(heroVideo.duration) ? heroVideo.duration : 0;
    if (duration > 0) {
      const desiredTime = Math.min(duration - 0.04, smoothProgress * duration);
      if (Math.abs(heroVideo.currentTime - desiredTime) > 0.025) heroVideo.currentTime = desiredTime;
    }
    chapters.forEach((chapter, index) => {
      const center = index / (chapters.length - 1);
      const distance = Math.abs(smoothProgress - center);
      const opacity = Math.max(0, 1 - distance / 0.23);
      chapter.style.setProperty('--chapter-opacity', opacity.toFixed(3));
      chapter.style.setProperty('--chapter-y', `${((center - smoothProgress) * 170).toFixed(1)}px`);
      chapter.style.setProperty('--chapter-scale', (0.965 + opacity * 0.035).toFixed(3));
      chapter.style.setProperty('--chapter-blur', `${((1 - opacity) * 8).toFixed(1)}px`);
    });
    frame = requestAnimationFrame(renderStory);
  }
  frame = requestAnimationFrame(renderStory);

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.setAttribute('data-visible', 'true');
    });
  }, { threshold: 0.16 });
  document.querySelectorAll('[data-reveal]').forEach(item => revealObserver.observe(item));

  const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.showcase-video').forEach(video => videoObserver.observe(video));

  const overlays = [...document.querySelectorAll('.overlay')];
  function closeOverlays() {
    overlays.forEach(overlay => { overlay.hidden = true; });
    document.body.classList.remove('overlay-open');
  }
  function openOverlay(name) {
    closeOverlays();
    const overlay = document.querySelector(`#${name}-overlay`);
    if (!overlay) return;
    overlay.hidden = false;
    document.body.classList.add('overlay-open');
    if (name === 'search') requestAnimationFrame(() => document.querySelector('#site-search')?.focus());
  }
  document.querySelectorAll('[data-overlay-open]').forEach(button => button.addEventListener('click', () => openOverlay(button.dataset.overlayOpen)));
  document.querySelectorAll('.close-overlay').forEach(button => button.addEventListener('click', closeOverlays));
  overlays.forEach(overlay => overlay.addEventListener('mousedown', event => { if (event.target === overlay) closeOverlays(); }));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeOverlays(); });

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    closeOverlays();
  }
  document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => scrollToSection(button.dataset.scroll)));
  document.querySelector('.close-and-collection')?.addEventListener('click', () => scrollToSection('collection'));
  document.querySelector('.search-form')?.addEventListener('submit', event => event.preventDefault());
  window.addEventListener('beforeunload', () => { if (frame) cancelAnimationFrame(frame); });
})();
