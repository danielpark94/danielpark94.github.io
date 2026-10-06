const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');

menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
  siteNav?.classList.toggle('is-open', !expanded);
});

siteNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open menu');
    siteNav.classList.remove('is-open');
  });
});

const mediaLightbox = document.querySelector('#media-lightbox');
const lightboxImage = mediaLightbox?.querySelector('img');

document.querySelectorAll('[data-lightbox]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!mediaLightbox || !lightboxImage) return;
    lightboxImage.src = button.dataset.lightbox;
    lightboxImage.alt = button.querySelector('img')?.alt || 'Expanded project artwork';
    mediaLightbox.showModal();
  });
});

mediaLightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => mediaLightbox.close());
mediaLightbox?.addEventListener('click', (event) => {
  if (event.target === mediaLightbox) mediaLightbox.close();
});
mediaLightbox?.addEventListener('close', () => {
  if (lightboxImage) lightboxImage.removeAttribute('src');
});

const workViewButtons = document.querySelectorAll('[data-work-view]');

workViewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const view = button.dataset.workView;
    const panelId = view === 'clients' ? 'by-client' : 'by-skill';

    workViewButtons.forEach((option) => {
      const isActive = option === button;
      option.classList.toggle('is-active', isActive);
      option.setAttribute('aria-pressed', String(isActive));
    });

    document.querySelectorAll('.work-panel').forEach((panel) => {
      panel.hidden = panel.id !== panelId;
    });
  });
});
