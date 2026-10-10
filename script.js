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
    // Keep navigation within the smallest meaningful album, including nested
    // secondary-business galleries and single-work illustration groups.
    const album = button.closest('[data-lightbox-group], .noroo-business, .case-gallery, .illustration-client-group, .bento-grid');
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

// Swipeable About recommendations; the centered card gets the visual emphasis.
const testimonialTrack = document.querySelector('.testimonial-track');
if (testimonialTrack) {
  const testimonialCards = [...testimonialTrack.querySelectorAll('.testimonial-card')];
  const testimonialDots = document.querySelector('.testimonial-dots');
  const dots = testimonialCards.map((card, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show recommendation ${index + 1}`);
    dot.addEventListener('click', () => card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }));
    testimonialDots?.append(dot);
    return dot;
  });
  const updateCenteredCard = () => {
    const trackCenter = testimonialTrack.getBoundingClientRect().left + testimonialTrack.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;
    testimonialCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - trackCenter);
      if (distance < closestDistance) { closestDistance = distance; closestIndex = index; }
    });
    testimonialCards.forEach((card, index) => card.classList.toggle('is-centered', index === closestIndex));
    dots.forEach((dot, index) => dot.setAttribute('aria-current', String(index === closestIndex)));
  };
  testimonialTrack.addEventListener('scroll', updateCenteredCard, { passive: true });
  window.addEventListener('resize', updateCenteredCard);
  updateCenteredCard();
}

// Recommendation documents are stored as an authenticated encrypted payload.
// The password is never embedded in the public HTML or JavaScript.
const lettersDialog = document.querySelector('#letters-dialog');
const lettersForm = document.querySelector('#letters-form');
const lettersPassword = document.querySelector('#letters-password');
const lettersError = document.querySelector('#letters-error');
const lettersSubmit = document.querySelector('.letters-submit');
document.querySelector('#letters-open')?.addEventListener('click', () => {
  lettersError.textContent = '';
  lettersPassword.value = '';
  lettersDialog?.showModal();
  lettersPassword?.focus();
});
lettersDialog?.querySelector('.letters-dialog-close')?.addEventListener('click', () => lettersDialog.close());
lettersDialog?.addEventListener('click', (event) => {
  if (event.target === lettersDialog) lettersDialog.close();
});
lettersForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  lettersError.textContent = '';
  lettersSubmit.disabled = true;
  lettersSubmit.textContent = 'Unlocking…';
  try {
    const response = await fetch('assets/about/recommendations.enc', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load the encrypted letters.');
    const envelope = new Uint8Array(await response.arrayBuffer());
    const magic = new TextDecoder().decode(envelope.slice(0, 8));
    if (magic !== 'DPLETTR1') throw new Error('Invalid encrypted archive.');
    const salt = envelope.slice(8, 24);
    const iv = envelope.slice(24, 36);
    const tag = envelope.slice(36, 52);
    const ciphertext = envelope.slice(52);
    const encryptedWithTag = new Uint8Array(ciphertext.length + tag.length);
    encryptedWithTag.set(ciphertext);
    encryptedWithTag.set(tag, ciphertext.length);
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(lettersPassword.value), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 1200000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const archive = await crypto.subtle.decrypt({ name: 'AES-GCM', iv, tagLength: 128 }, key, encryptedWithTag);
    const url = URL.createObjectURL(new Blob([archive], { type: 'application/zip' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Daniel-Park-Recommendation-Letters.zip';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    lettersDialog.close();
  } catch (error) {
    lettersError.textContent = error?.name === 'OperationError' ? 'Incorrect password. Please try again.' : 'Unable to unlock the letters right now. Please try again.';
  } finally {
    lettersSubmit.disabled = false;
    lettersSubmit.textContent = 'Unlock & Download';
  }
});


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
