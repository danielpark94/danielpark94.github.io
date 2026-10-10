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
const lightboxPrev = mediaLightbox?.querySelector('.lightbox-prev');
const lightboxNext = mediaLightbox?.querySelector('.lightbox-next');
let lightboxItems = [];
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
  const hasMultipleImages = lightboxItems.length > 1;
  if (lightboxPrev) lightboxPrev.hidden = !hasMultipleImages;
  if (lightboxNext) lightboxNext.hidden = !hasMultipleImages;
  lightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
  const item = lightboxItems[lightboxIndex];
  lightboxImage.src = item.dataset.lightbox;
  lightboxImage.alt = item.querySelector('img')?.alt || 'Expanded project artwork';
};

document.querySelectorAll('[data-lightbox]').forEach((button) => {
  button.addEventListener('click', () => {
    const album = button.closest('.case-gallery');
    lightboxItems = [...(album?.querySelectorAll('[data-lightbox]') || [button])];
    showLightboxItem(lightboxItems.indexOf(button));
    if (!mediaLightbox) return;
    mediaLightbox.showModal();
  });
});

document.querySelectorAll('[data-video]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!mediaLightbox || !lightboxVideo || !lightboxImage) return;
    lightboxImage.hidden = true;
    lightboxPrev.hidden = true;
    lightboxNext.hidden = true;
    lightboxItems = [];
    lightboxVideo.hidden = false;
    lightboxVideo.src = button.dataset.video;
    lightboxVideo.loop = button.dataset.videoLoop === 'true';
    const videoPoster = button.querySelector('img')?.src;
    if (videoPoster) lightboxVideo.poster = videoPoster;
    else lightboxVideo.removeAttribute('poster');
    mediaLightbox.showModal();
    lightboxVideo.load();
    lightboxVideo.play().catch(() => {});
  });
});

const scrollVideos = document.querySelectorAll('video:not(.lightbox-video)');
const campaignSoundToggle = document.querySelector('.campaign-sound-toggle');

scrollVideos.forEach((video) => {
  video.muted = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
});

if ('IntersectionObserver' in window) {
  const campaignVideoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.muted = true;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.15 });
  scrollVideos.forEach((video) => campaignVideoObserver.observe(video));
} else {
  scrollVideos.forEach((video) => video.play().catch(() => {}));
}

campaignSoundToggle?.addEventListener('click', () => {
  const campaignVideo = document.querySelector('[data-scroll-autoplay]');
  if (!campaignVideo) return;
  campaignVideo.muted = !campaignVideo.muted;
  const soundEnabled = !campaignVideo.muted;
  campaignSoundToggle.setAttribute('aria-pressed', String(soundEnabled));
  campaignSoundToggle.textContent = soundEnabled ? 'Mute sound' : 'Enable sound';
  if (soundEnabled) campaignVideo.play().catch(() => {});
});

lightboxPrev?.addEventListener('click', () => showLightboxItem(lightboxIndex - 1));
lightboxNext?.addEventListener('click', () => showLightboxItem(lightboxIndex + 1));
mediaLightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => mediaLightbox.close());
mediaLightbox?.addEventListener('click', (event) => {
  if (event.target === mediaLightbox) mediaLightbox.close();
});
mediaLightbox?.addEventListener('close', () => {
  if (lightboxImage) lightboxImage.removeAttribute('src');
  lightboxItems = [];
  if (lightboxVideo) {
    lightboxVideo.pause();
    lightboxVideo.loop = false;
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

// Keep the selected Work toggle when returning from one of its category pages.
if (window.location.hash === '#by-skill') {
  document.querySelector('[data-work-view="skills"]')?.click();
}


// Keep long image sections compact until the visitor asks to see the rest.
document.querySelectorAll('.case-gallery .case-image-grid').forEach((grid) => {
  const images = [...grid.querySelectorAll('[data-lightbox]')];
  if (images.length <= 9) return;
  images.slice(9).forEach((image) => {
    image.classList.add('is-collapsed-image');
    image.hidden = true;
  });
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'gallery-more-button';
  toggle.textContent = 'View more';
  toggle.setAttribute('aria-expanded', 'false');
  grid.insertAdjacentElement('afterend', toggle);
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    images.slice(9).forEach((image) => { image.hidden = expanded; });
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.textContent = expanded ? 'View more' : 'Show less';
  });
});

// Let mobile visitors move through the current image album with a horizontal swipe.
let lightboxTouchStart = null;
lightboxImage?.addEventListener('touchstart', (event) => {
  if (event.touches.length !== 1) return;
  const touch = event.touches[0];
  lightboxTouchStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });
lightboxImage?.addEventListener('touchend', (event) => {
  if (!lightboxTouchStart || !window.matchMedia('(max-width: 800px)').matches) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - lightboxTouchStart.x;
  const dy = touch.clientY - lightboxTouchStart.y;
  lightboxTouchStart = null;
  if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
  showLightboxItem(lightboxIndex + (dx < 0 ? 1 : -1));
}, { passive: true });
