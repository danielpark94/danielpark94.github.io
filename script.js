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
const lightboxVideo = mediaLightbox?.querySelector('.lightbox-video');
const lightboxNext = mediaLightbox?.querySelector('.lightbox-next');
const lightboxItems = [...document.querySelectorAll('[data-lightbox]')];
let lightboxIndex = -1;

const showLightboxItem = (index) => {
  if (!mediaLightbox || !lightboxImage || lightboxItems.length === 0) return;
  lightboxVideo?.pause();
  if (lightboxVideo) {
    lightboxVideo.hidden = true;
    lightboxVideo.removeAttribute('src');
    lightboxVideo.removeAttribute('poster');
    lightboxVideo.load();
  }
  lightboxImage.hidden = false;
  if (lightboxNext) lightboxNext.hidden = false;
  lightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
  const item = lightboxItems[lightboxIndex];
  lightboxImage.src = item.dataset.lightbox;
  lightboxImage.alt = item.querySelector('img')?.alt || 'Expanded project artwork';
};

lightboxItems.forEach((button, index) => {
  button.addEventListener('click', () => {
    showLightboxItem(index);
    if (!mediaLightbox) return;
    mediaLightbox.showModal();
  });
});

document.querySelectorAll('[data-video]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!mediaLightbox || !lightboxVideo || !lightboxImage) return;
    lightboxImage.hidden = true;
    lightboxNext.hidden = true;
    lightboxVideo.hidden = false;
    lightboxVideo.src = button.dataset.video;
    lightboxVideo.poster = button.querySelector('img')?.src || '';
    mediaLightbox.showModal();
    lightboxVideo.load();
    lightboxVideo.play().catch(() => {});
  });
});

lightboxNext?.addEventListener('click', () => showLightboxItem(lightboxIndex + 1));
mediaLightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => mediaLightbox.close());
mediaLightbox?.addEventListener('click', (event) => {
  if (event.target === mediaLightbox) mediaLightbox.close();
});
mediaLightbox?.addEventListener('close', () => {
  if (lightboxImage) lightboxImage.removeAttribute('src');
  if (lightboxVideo) {
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.removeAttribute('poster');
    lightboxVideo.load();
  }
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
