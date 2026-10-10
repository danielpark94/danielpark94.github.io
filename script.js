let activeLanguage = localStorage.getItem('portfolio-language') === 'es' ? 'es' : 'en';

const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');

menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', activeLanguage === 'es' ? (expanded ? 'Abrir menú' : 'Cerrar menú') : (expanded ? 'Open menu' : 'Close menu'));
  siteNav?.classList.toggle('is-open', !expanded);
});

siteNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', activeLanguage === 'es' ? 'Abrir menú' : 'Open menu');
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
  lettersSubmit.textContent = activeLanguage === 'es' ? 'Descargando…' : 'Unlocking…';
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
    lettersError.textContent = activeLanguage === 'es'
      ? (error?.name === 'OperationError' ? 'Contraseña incorrecta. Inténtalo de nuevo.' : 'No se pudieron descargar las cartas. Inténtalo de nuevo.')
      : (error?.name === 'OperationError' ? 'Incorrect password. Please try again.' : 'Unable to unlock the letters right now. Please try again.');
  } finally {
    lettersSubmit.disabled = false;
    lettersSubmit.textContent = activeLanguage === 'es' ? 'Desbloquear y descargar' : 'Unlock & Download';
  }
});

// GitHub Pages is static, so prepare the message in the visitor's email app.
document.querySelector('#contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = new FormData(form);
  const spanish = activeLanguage === 'es';
  const body = [
    `${spanish ? 'Nombre y apellido' : 'Name'}: ${values.get('Name')}`,
    `${spanish ? 'Cargo o empresa' : 'Role or company'}: ${values.get('Role or company') || (spanish ? 'No indicado' : 'Not provided')}`,
    `${spanish ? 'Motivo' : 'Reason'}: ${values.get('Reason')}`,
    '',
    spanish ? 'Mensaje:' : 'Message:',
    values.get('Message'),
  ].join('\n');
  const subject = `${spanish ? 'Consulta sobre el portfolio' : 'Portfolio inquiry'} — ${values.get('Reason')}`;
  window.location.href = `mailto:work.danielpark@gmail.com?cc=dnlprk89@gmail.com&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
  toggle.textContent = activeLanguage === 'es' ? 'Ver más' : 'View more';
  toggle.setAttribute('aria-expanded', 'false');
  grid.insertAdjacentElement('afterend', toggle);
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    images.slice(9).forEach((image) => { image.hidden = expanded; });
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.textContent = expanded ? (activeLanguage === 'es' ? 'Ver más' : 'View more') : (activeLanguage === 'es' ? 'Ver menos' : 'Show less');
  });
});

// Let mobile visitors move through the current image album with a horizontal swipe.
let lightboxTouchStart = null;
lightboxImage?.addEventListener('touchstart', (event) => {
  if (event.touches.length !== 1) return;
  const touch = event.touches[0];
  lightboxTouchStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });

// Lightweight bilingual mode for the static portfolio. English remains the
// source language; the selected language is remembered as visitors navigate.
const spanishCopy = {
  'Menu':'Menú','Work':'Trabajo','About':'Sobre mí','Contact':'Contacto','Back to Work':'Volver a proyectos','More Projects':'Más proyectos',
  'By Client':'Por cliente','By Skill':'Por especialidad','Selected Work':'Proyectos destacados','All Projects':'Todos los proyectos','Other Work':'Otros proyectos','Other Clients':'Otros clientes','Selected projects across several clients':'Proyectos seleccionados de distintos clientes','Self-Initiated Projects':'Proyectos personales','Ideas and work created by choice':'Ideas y proyectos creados por iniciativa propia','See All Projects':'Ver todos los proyectos','Go Back':'Volver','Previous':'Anterior','Next':'Siguiente','Prev':'Anterior','View more':'Ver más','Show less':'Ver menos','Click or tap a picture to expand':'Haz clic o toca una imagen para ampliarla','Video plays automatically when visible':'El video se reproduce al aparecer en pantalla',
  'Art Director':'Director de Arte','Graphic Designer':'Diseñador Gráfico','Guayaquil, Ecuador':'Guayaquil, Ecuador','Available Worldwide':'Disponible en todo el mundo','Based in':'Con base en','About Me':'Sobre mí','The Toolkit':'Herramientas','The Clients':'Clientes','Comments from Clients':'Comentarios de clientes','Recommendation Letters':'Cartas de recomendación','Password-protected download':'Descarga protegida con contraseña','Enter password to download the letters':'Ingresa la contraseña para descargar las cartas','Unlock & Download':'Desbloquear y descargar','Have a project in mind?':'¿Tienes un proyecto en mente?','Let’s make something worth looking at.':'Hagamos algo que valga la pena ver.','Let’s Work':'Trabajemos','Together.':'juntos.','First and last name':'Nombre y apellido','Role or company':'Cargo o empresa','Reason for reaching out':'Motivo de contacto','Select a reason':'Selecciona un motivo','Project inquiry':'Consulta de proyecto','Collaboration':'Colaboración','Employment opportunity':'Oportunidad laboral','Other':'Otro','Message':'Mensaje','Send a message':'Enviar mensaje','Chat on WhatsApp':'Escríbeme por WhatsApp','Your email app will open with your message ready to send.':'Se abrirá tu correo con el mensaje listo para enviar.','Don’t be shy,':'No seas tímido,','reach out for more info!':'¡escríbeme para más información!',
  'Digital Media':'Medios digitales','Packaging':'Empaques','UI Design':'Diseño UI','Print Media':'Material impreso','Illustrations':'Ilustración','Key Visuals':'Piezas clave','Food Photography':'Fotografía gastronómica','Graphic Tees':'Camisetas gráficas','Brand Direction / Campaign / Motion Graphics':'Dirección de marca / Campaña / Gráficos en movimiento','Campaign / Social Media / Key Visual':'Campaña / Redes sociales / Piezas clave','Brand Direction / Packaging / Branding':'Dirección de marca / Empaques / Branding','Art Direction / Packaging / Food Photography':'Dirección de arte / Empaques / Fotografía gastronómica','Social Media / Motion Graphics / Food Photography':'Redes sociales / Gráficos en movimiento / Fotografía gastronómica','Packaging / Digital Menu / Out-of-Home':'Empaques / Menú digital / Publicidad exterior','Brand Identity / Packaging / Print / UI Design':'Identidad de marca / Empaques / Impresos / Diseño UI','Brand Creation / Social Media':'Creación de marca / Redes sociales','Advertising / Branding / Conceptualization':'Publicidad / Branding / Conceptualización','Brand Direction / Packaging / Print Media':'Dirección de marca / Empaques / Material impreso','Brand Direction / POP':'Dirección de marca / Material POP','Client Work / Personal Projects':'Proyectos para clientes / Proyectos personales','Art Direction / Creative Direction':'Dirección de arte / Dirección creativa','Photography / Art Direction':'Fotografía / Dirección de arte','Illustration / Branding / Conceptualization':'Ilustración / Branding / Conceptualización','Brand Direction / Packaging / Print Media':'Dirección de marca / Empaques / Material impreso',
  'About the Brand':'Sobre la marca','The Challenge':'El desafío','The Approach':'El enfoque','Role':'Rol','Year':'Año','Scope':'Alcance','Social Media':'Redes sociales','Motion Graphics':'Gráficos en movimiento','Secondary Accounts':'Marcas secundarias','Selected campaign pieces':'Piezas seleccionadas de campaña','Enable sound':'Activar sonido','Mute sound':'Silenciar','Logo Redesign':'Rediseño de logo','Character Redesign':'Rediseño del personaje','Brand Redesign':'Rediseño de marca','T-Shirt Design':'Diseño de camisetas','Digital Menu':'Menú digital','Out-of-Home Advertising':'Publicidad exterior','Themed Logos':'Logos temáticos','Concept Art':'Arte conceptual','Stationery':'Papelería','Campaigns':'Campañas','Print & Merchandising':'Material impreso y merchandising','Secondary Businesses':'Negocios asociados','Client project':'Proyecto personal','Free-Style Work':'Trabajo libre','Thoughts and Noises':'Pensamientos y ruido','Doggos':'Perritos','Some Weekly Mood':'Un poco del ánimo semanal','Up in the Air':'En el aire','Fruitees':'Fruitees','Brand Identity':'Identidad de marca','Brand Creation':'Creación de marca','Packaging Design':'Diseño de empaques','Digital Design':'Diseño digital','Art Direction':'Dirección de arte','Graphic Design':'Diseño gráfico','Brand Direction':'Dirección de marca','Branding':'Branding','Illustration':'Ilustración','Advertising':'Publicidad','Food Photography':'Fotografía gastronómica','Personal Projects':'Proyectos personales','Go Back':'Volver',
  'The Place was an Ecuadorian restaurant built around its Grill & Drinks concept: a place for lunch and an easy spot to unwind with friends after work. Located on one of Urdesa’s most popular streets in Guayaquil, it brought people together over food and drinks.':'The Place fue un restaurante ecuatoriano basado en el concepto Grill & Drinks: un lugar para almorzar y relajarse con amigos después del trabajo. Ubicado en una de las calles más concurridas de Urdesa, Guayaquil, reunía a la gente alrededor de la comida y las bebidas.',
  'The Place had a strong concept and an appealing location, but its social media lacked a distinctive tone and visual feel. It needed a clearer personality to communicate the energy of the venue and make its food and drinks stand out.':'The Place tenía un concepto sólido y una ubicación atractiva, pero sus redes sociales carecían de una voz y una identidad visual propias. Necesitaba expresar mejor la energía del lugar y destacar su comida y bebidas.',
  'I translated the spirit of a laid-back gathering spot into a bold, consistent visual direction across social media, motion graphics, custom T-shirt designs and food photography—bringing the brand’s energy and appetite appeal to every touchpoint.':'Transformé el espíritu de este punto de encuentro en una dirección visual llamativa y coherente para redes sociales, gráficos en movimiento, camisetas y fotografía gastronómica.',
  'Waffles & Subs was an Ecuadorian food brand built around waffles, milkshakes and sandwiches, serving a playful, indulgent take on casual dining.':'Waffles & Subs fue una marca ecuatoriana de waffles, malteadas y sándwiches, con una propuesta divertida y generosa de comida casual.',
  'The brand was trying to be too many things at once—from restaurant and coffee lounge to dessert bar—without a clear visual identity. It needed a stronger point of view that put its products at the center.':'La marca intentaba ser muchas cosas a la vez —restaurante, cafetería y barra de postres— sin una identidad visual clara. Necesitaba una propuesta más definida que pusiera sus productos en el centro.',
  'I built a bold visual identity around a simple idea: the product is the moment. I carried that system across social media, delivery and seasonal packaging, staff apparel, motion graphics and food photography.':'Desarrollé una identidad visual llamativa alrededor de una idea simple: el producto es el protagonista. La apliqué en redes sociales, empaques para entregas y temporadas, uniformes, gráficos en movimiento y fotografía gastronómica.',
  'Dunkin’ is a globally recognized coffee and donut brand. I was a longtime fan and had the opportunity to work in-house with the Dunkin’ Ecuador team, creating local brand experiences with its signature donuts at the center.':'Dunkin’ es una reconocida marca global de café y donas. Como admirador de la marca, tuve la oportunidad de trabajar junto al equipo de Dunkin’ Ecuador para crear experiencias locales alrededor de sus donas.',
  'Donuts were Dunkin’s best-selling product, while savory items and beverages received less attention. The donut boxes also needed a fresh look that could stand out locally while remaining true to the brand.':'Las donas eran el producto más vendido de Dunkin’, mientras que los productos salados y las bebidas recibían menos atención. Además, las cajas necesitaban una imagen renovada que destacara localmente y respetara la marca.',
  'I refreshed the donut-box packaging and created seasonal designs that gave Dunkin’s best-selling product a bolder presence. The prototype pushed beyond the expected and received positive feedback from the U.S. team. I also contributed to digital menu and out-of-home work.':'Renové los empaques de las cajas de donas y creé diseños de temporada para dar más presencia a su producto estrella. La propuesta superó lo esperado y recibió buenos comentarios del equipo en Estados Unidos. También trabajé en el menú digital y publicidad exterior.',
  'La Reforma is a paper products manufacturer specializing in toilet paper and paper towels. Its portfolio includes its own brands and products for retail partners in Ecuador and Panama.':'La Reforma es una empresa fabricante de papel higiénico y toallas de papel. Su portafolio incluye marcas propias y productos para cadenas comerciales de Ecuador y Panamá.',
  'Blanchy serves both industrial and household users across a wide product range. Its identity needed a complete refresh to better represent the brand and stay consistent across very different products.':'Blanchy atiende tanto al mercado industrial como al hogar con una amplia gama de productos. Su identidad necesitaba renovarse para representar mejor la marca y mantener coherencia entre sus distintas líneas.',
  'I redesigned Blanchy’s brand identity and mascot, then developed more than 40 packaging designs across the product range. The refreshed system extended across digital, print, events, POP and BTL materials.':'Rediseñé la identidad y el personaje de Blanchy, y desarrollé más de 40 empaques para su portafolio. El nuevo sistema también se aplicó en piezas digitales, impresas, eventos, material POP y BTL.',
  'To strengthen Blanchy’s presence on store shelves, I proposed a logo redesign. The new mark is clearer and more legible, with a bolder, more impactful presence and greater versatility across packaging and brand applications.':'Para destacar a Blanchy en los puntos de venta, propuse rediseñar su logo. La nueva versión es más clara y legible, con mayor impacto y versatilidad para empaques y distintas aplicaciones de marca.',
  'Blanchy’s mascot has been a brand staple for years, much like Scott’s iconic Golden Retriever. The original character was designed for a vertical format, which limited how it could be used. The new 3D model feels more contemporary and adapts easily to different layouts, while integrating naturally with the redesigned logo.':'La mascota de Blanchy ha sido parte esencial de la marca durante años, como el icónico Golden Retriever de Scott’s. El personaje original estaba pensado para un formato vertical, lo que limitaba sus usos. El nuevo modelo 3D luce actual, se adapta a distintos formatos y se integra con naturalidad al logo renovado.',
  'Chiveria is an established Ecuadorian dairy brand with a wide range of yogurt and functional products. This project brought its natural ingredients to the forefront through a fresh visual presence across campaigns, social media and digital touchpoints.':'Chiveria es una reconocida marca ecuatoriana de lácteos con una amplia gama de yogures y productos funcionales. El proyecto destacó sus ingredientes naturales con una presencia visual renovada en campañas, redes sociales y medios digitales.',
  'As a familiar household name, Chiveria needed to stand apart in a crowded dairy category. Its strongest advantage was already there—natural ingredients—but that promise needed a memorable, consistent expression.':'Como marca conocida por las familias, Chiveria necesitaba destacar en una categoría muy competida. Su mayor ventaja ya existía —los ingredientes naturales—, pero necesitaba expresarse de forma memorable y coherente.',
  'I built a flexible campaign system rooted in nature, with fresh product storytelling across social media, landing pages, print and BTL. Each touchpoint reinforces Chiveria’s approachable character while keeping the brand recognizable.':'Desarrollé un sistema flexible de campaña inspirado en la naturaleza, con historias de producto para redes sociales, páginas de campaña, piezas impresas y BTL. Cada medio refuerza el carácter cercano de Chiveria y mantiene reconocible la marca.',
  'Gambly is an AI-powered sports betting tool built to help users organize, analyze and better understand their bets. My work focused on developing a strong, flexible visual language across social media, campaigns, motion and product communication.':'Gambly es una herramienta de apuestas deportivas con inteligencia artificial que ayuda a organizar, analizar y entender mejor las apuestas. Mi trabajo se centró en desarrollar un lenguaje visual sólido y flexible para redes sociales, campañas, animación y comunicación de producto.',
  'The brand needed to communicate complex betting information in a fast, clear and visually engaging way. At the same time, the system had to remain consistent across multiple sports, content formats and rapidly changing daily topics.':'La marca debía comunicar información compleja sobre apuestas de forma rápida, clara y atractiva. A la vez, el sistema debía mantener coherencia entre distintos deportes, formatos y temas que cambian a diario.',
  'I developed a modular visual system built around bold typography, dynamic sports imagery, clear hierarchy and adaptable layouts. This allowed the brand to move quickly across different formats while maintaining a recognizable and cohesive identity.':'Desarrollé un sistema visual modular con tipografía contundente, imágenes deportivas dinámicas, jerarquía clara y composiciones adaptables. Así, la marca pudo moverse con agilidad entre formatos sin perder una identidad reconocible y coherente.',
  'NOROO LATAM is the Latin American division of NOROO, the renowned South Korean paints and coatings company. Combining products from South Korea with solutions developed in Ecuador, it serves industrial and home markets with high-quality paints and epoxy coatings.':'NOROO LATAM es la división latinoamericana de NOROO, reconocida compañía surcoreana de pinturas y recubrimientos. Combina productos de Corea del Sur con soluciones desarrolladas en Ecuador para los mercados industrial y residencial.',
  'NOROO LATAM needed a distinct identity within a global brand and stronger recognition across the region. Its communications had to speak to both industrial and home audiences while supporting a diverse product portfolio.':'NOROO LATAM necesitaba una identidad propia dentro de una marca global y mayor reconocimiento regional. Su comunicación debía conectar con los públicos industrial y residencial, y representar un portafolio diverso.',
  'I created the NOROO LATAM sub-brand and led campaigns to strengthen its market positioning. I developed the print media system and merchandising, and directed the visual communication for its related businesses.':'Creé la submarca NOROO LATAM y dirigí campañas para fortalecer su posicionamiento. También desarrollé el sistema de piezas impresas y merchandising, y dirigí la comunicación visual de sus negocios asociados.',
  'Piaccere was created from the ground up in close collaboration with its owner. The brand celebrates self-love and the joy of treating yourself to something special, showing that empowerment can feel confident, elegant and entirely your own.':'Piaccere nació desde cero en colaboración cercana con su propietaria. La marca celebra el amor propio y el gusto de darte algo especial, mostrando que el empoderamiento también puede sentirse seguro, elegante y muy personal.',
  'This project brought me into an unfamiliar category. The challenge was to translate the owner’s perspective into a distinctive brand that felt empowering without relying on the expected tough or aggressive look.':'Este proyecto me llevó a una categoría nueva para mí. El desafío fue traducir la perspectiva de la propietaria en una marca distintiva y empoderada, sin recurrir a una imagen dura o agresiva.',
  'Working alongside the owner, I developed Piaccere from the ground up. Its visual identity and social content frame self-love as a form of confidence—and treating yourself as a small, meaningful celebration.':'Junto a la propietaria, desarrollé Piaccere desde cero. Su identidad visual y contenido para redes presentan el amor propio como una forma de confianza y el acto de consentirte como una celebración personal.',
  'Art director and graphic designer who turns ideas into clear, memorable visual stories. My work spans brand identity, campaigns, packaging, digital media, and UI design. I bring creative thinking, adaptability, and a hands-on approach to every project—from the first concept to the final details.':'Director de arte y diseñador gráfico que convierte ideas en historias visuales claras y memorables. Trabajo en identidad de marca, campañas, empaques, medios digitales y diseño UI. Aporto creatividad, adaptabilidad y un enfoque práctico a cada proyecto, desde el concepto inicial hasta los detalles finales.',
  '“Daniel is dependable, versatile, hardworking, and adaptable. He was a valued member of our team, and I would gladly work with him again.”':'“Daniel es confiable, versátil, trabajador y adaptable. Fue un integrante muy valioso para nuestro equipo y volvería a trabajar con él con gusto.”','“Daniel is proactive, collaborative, and always brings thoughtful ideas to the table. I highly recommend him.”':'“Daniel es proactivo, colaborador y siempre aporta ideas valiosas. Lo recomiendo ampliamente.”','“Daniel turns brand needs into clear, practical, and visually strong solutions. He is adaptable, detail-oriented, and a trusted creative partner.”':'“Daniel convierte las necesidades de marca en soluciones claras, prácticas y visualmente sólidas. Es adaptable, detallista y un aliado creativo de confianza.”','“Daniel is dedicated, responsible, and highly capable. His positive attitude and teamwork made him a valued colleague.”':'“Daniel es dedicado, responsable y muy capaz. Su actitud positiva y capacidad para trabajar en equipo lo convirtieron en un gran colega.”','“Daniel performed his duties as Art Director exceptionally during his time at Namú Estudio Creativo.”':'“Daniel desempeñó su trabajo como director de arte de manera excepcional durante su tiempo en Namú Estudio Creativo.”',
  'Don’t be shy,':'No seas tímido,','reach out for more info!':'¡escríbeme para más información!',
  'Head of Marketing at Chiveria':'Directora de Marketing en Chiveria','Head of Marketing at La Reforma':'Directora de Marketing en La Reforma','Authorized Representative at Gambly Inc.':'Representante autorizada en Gambly Inc.','Selection Assistant at Quantumbit':'Asistente de selección en Quantumbit','Coordinator at Namú Estudio Creativo':'Coordinadora en Namú Estudio Creativo','Click or tap the play button to watch':'El video se reproduce al aparecer en pantalla','Click or tap a thumbnail to play':'El video se reproduce al aparecer en pantalla','Brand Direction / Advertising / Conceptualization':'Dirección de marca / Publicidad / Conceptualización','Art Direction / Campaign':'Dirección de arte / Campaña','Brand Direction / POP':'Dirección de marca / Material POP','Brand Direction / Packaging / Branding':'Dirección de marca / Empaques / Branding','Campaign / Packaging / POP':'Campaña / Empaques / Material POP','Social Media / Food Photography':'Redes sociales / Fotografía gastronómica','UI Design / Packaging / Social Media':'Diseño UI / Empaques / Redes sociales','Brand Direction / Packaging / Print Media':'Dirección de marca / Empaques / Material impreso','Illustration / Branding / Conceptualization':'Ilustración / Branding / Conceptualización','Photography / Art Direction':'Fotografía / Dirección de arte','Brand Identity / Packaging / Print / UI Design':'Identidad de marca / Empaques / Impresos / Diseño UI','Campaign / Social Media / Key Visual':'Campaña / Redes sociales / Piezas clave','Role':'Rol','Art Direction':'Dirección de arte','Graphic Design':'Diseño gráfico','Digital Media':'Medios digitales','Social Media':'Redes sociales','Packaging Design':'Diseño de empaques','Food Photography':'Fotografía gastronómica','Brand Identity':'Identidad de marca','Brand Creation':'Creación de marca','Campaign':'Campaña','Year':'Año','Available Worldwide':'Disponible en todo el mundo','Based in':'Con base en','2024 - 2025':'2024 - 2025','2025 - 2026':'2025 - 2026','Created from the ground up':'Creada desde cero','Brand identity developed from the ground up':'Identidad de marca creada desde cero'
};

const pageTitlesEs = {
  'Daniel Park — Art Director & Graphic Designer':'Daniel Park — Director de Arte y Diseñador Gráfico','Work — Daniel Park':'Trabajo — Daniel Park','About — Daniel Park':'Sobre mí — Daniel Park','Contact — Daniel Park':'Contacto — Daniel Park','Gambly — Daniel Park':'Gambly — Daniel Park','Chiveria — Daniel Park':'Chiveria — Daniel Park','La Reforma — Daniel Park':'La Reforma — Daniel Park','Waffles & Subs — Daniel Park':'Waffles & Subs — Daniel Park','The Place — Daniel Park':'The Place — Daniel Park','Dunkin’ — Daniel Park':'Dunkin’ — Daniel Park','NOROO LATAM — Daniel Park':'NOROO LATAM — Daniel Park','Piaccere — Daniel Park':'Piaccere — Daniel Park','Other Clients — Daniel Park':'Otros clientes — Daniel Park','Self-Initiated Projects — Daniel Park':'Proyectos personales — Daniel Park','Illustrations — Daniel Park':'Ilustración — Daniel Park','Food Photography — Daniel Park':'Fotografía gastronómica — Daniel Park','Graphic Tees — Daniel Park':'Camisetas gráficas — Daniel Park','Packaging — Daniel Park':'Empaques — Daniel Park','UI Design — Daniel Park':'Diseño UI — Daniel Park','Digital Media — Daniel Park':'Medios digitales — Daniel Park','Print Media — Daniel Park':'Material impreso — Daniel Park','Key Visuals — Daniel Park':'Piezas clave — Daniel Park'
};

const descriptionsEs = {
  'Daniel Park — Art Director and Graphic Designer in Guayaquil, Ecuador. Available worldwide.':'Daniel Park — Director de Arte y Diseñador Gráfico en Guayaquil, Ecuador. Disponible para proyectos en todo el mundo.',
  'Selected client projects and creative skills by Daniel Park, Art Director and Graphic Designer.':'Proyectos de clientes y especialidades creativas de Daniel Park, director de arte y diseñador gráfico.',
  'About Daniel Park, Ecuadorian art director and graphic designer.':'Conoce a Daniel Park, director de arte y diseñador gráfico ecuatoriano.',
  'Get in touch with Daniel Park for projects, collaborations, and creative inquiries.':'Contacta a Daniel Park para proyectos, colaboraciones y consultas creativas.'
};

const applyPortfolioLanguage = (language) => {
  activeLanguage = language;
  document.documentElement.lang = language;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const parentTag = node.parentElement?.tagName;
    if (!node.nodeValue.trim() || ['SCRIPT','STYLE','NOSCRIPT','SVG'].includes(parentTag)) continue;
    if (!node.__portfolioEnglish) node.__portfolioEnglish = node.nodeValue;
    const original = node.__portfolioEnglish;
    const key = original.replace(/\s+/g, ' ').trim();
    const translated = spanishCopy[key];
    if (language === 'es' && translated) {
      const leading = original.match(/^\s*/)?.[0] || '';
      const trailing = original.match(/\s*$/)?.[0] || '';
      node.nodeValue = `${leading}${translated}${trailing}`;
    } else if (language === 'en') node.nodeValue = original;
  }
  const englishTitle = document.documentElement.dataset.englishTitle || document.title;
  document.documentElement.dataset.englishTitle = englishTitle;
  document.title = language === 'es' ? (pageTitlesEs[englishTitle] || englishTitle) : englishTitle;
  const description = document.querySelector('meta[name="description"]');
  if (description && language === 'es') description.content = descriptionsEs[description.content] || description.content;
  else if (description && language === 'en') {
    const english = Object.keys(descriptionsEs).find((key) => descriptionsEs[key] === description.content);
    if (english) description.content = english;
  }
  document.querySelectorAll('.language-switch button').forEach((button) => {
    const selected = button.dataset.language === language;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  if (menuButton) {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-label', language === 'es' ? (isOpen ? 'Cerrar menú' : 'Abrir menú') : (isOpen ? 'Close menu' : 'Open menu'));
  }
  siteNav?.setAttribute('aria-label', language === 'es' ? 'Navegación principal' : 'Main navigation');
  localStorage.setItem('portfolio-language', language);
};

document.querySelectorAll('.language-switch button').forEach((button) => {
  button.addEventListener('click', () => applyPortfolioLanguage(button.dataset.language));
});
applyPortfolioLanguage(activeLanguage);
lightboxImage?.addEventListener('touchend', (event) => {
  if (!lightboxTouchStart || !window.matchMedia('(max-width: 800px)').matches) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - lightboxTouchStart.x;
  const dy = touch.clientY - lightboxTouchStart.y;
  lightboxTouchStart = null;
  if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
  showLightboxItem(lightboxIndex + (dx < 0 ? 1 : -1));
}, { passive: true });
