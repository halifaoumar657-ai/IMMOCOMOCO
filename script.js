lucide.createIcons();

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.desktop-nav');
const navigationLinks = [...document.querySelectorAll('.desktop-nav a')];

const closeMenu = () => {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Ouvrir le menu');
  menuButton.innerHTML = '<i data-lucide="menu"></i>';
  lucide.createIcons();
};

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
  menuButton.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
  lucide.createIcons();
});

navigationLinks.forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('click', (event) => {
  if (navigation.classList.contains('open') && !navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});

// Le lien actif suit la section visible pour garder un repère clair sur les écrans longs.
const observedSections = navigationLinks
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navigationLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: '-25% 0px -65% 0px' });
  observedSections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll('.favorite').forEach((button) => {
  button.addEventListener('click', () => {
    button.classList.toggle('active');
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  });
});

// Les filtres travaillent sur les données présentes dans chaque carte, sans rechargement de page.
const searchForm = document.querySelector('#property-search');
const resultCount = document.querySelector('#result-count');
const emptyState = document.querySelector('#empty-state');
const liveCount = document.querySelector('.live-count');

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const location = document.querySelector('#location-filter').value;
  const type = document.querySelector('#type-filter').value;
  const maxPrice = document.querySelector('#price-filter').value;
  const cards = [...document.querySelectorAll('.property-card')];
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchesLocation = location === 'all' || card.dataset.location === location;
    const matchesType = type === 'all' || card.dataset.type === type;
    const matchesPrice = maxPrice === 'all' || Number(card.dataset.price) <= Number(maxPrice);
    const isVisible = matchesLocation && matchesType && matchesPrice;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  resultCount.textContent = `${visibleCount} bien${visibleCount > 1 ? 's' : ''} disponible${visibleCount > 1 ? 's' : ''}`;
  liveCount.textContent = visibleCount;
  emptyState.hidden = visibleCount !== 0;
  document.querySelector('#biens').scrollIntoView({ behavior: 'smooth' });
});

// Les chiffres se révèlent lorsque la section entre dans le viewport, sans animation permanente.
const counters = document.querySelectorAll('[data-count]');
const animateCounter = (counter) => {
  const target = Number(counter.dataset.count);
  const duration = 850;
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    counter.textContent = Math.round(progress * target);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.35 });
  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach((counter) => { counter.textContent = counter.dataset.count; });
}

// Ouverture d'une galerie plein écran pour conserver les photos accessibles sur mobile.
const lightbox = document.querySelector('#lightbox');
const lightboxPhoto = document.querySelector('.lightbox-photo');
const lightboxCaption = document.querySelector('.lightbox p');
document.querySelectorAll('.gallery-item').forEach((item) => {
  item.addEventListener('click', () => {
    lightboxPhoto.style.backgroundImage = item.style.backgroundImage;
    lightboxCaption.textContent = item.dataset.galleryTitle;
    lightbox.hidden = false;
  });
});
document.querySelector('.lightbox-close').addEventListener('click', () => { lightbox.hidden = true; });
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.hidden = true; });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') lightbox.hidden = true; });

document.querySelector('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const feedback = document.querySelector('.form-feedback');
  feedback.textContent = 'Merci, votre message a bien ete prepare. Nous revenons vers vous rapidement.';
  event.target.reset();
});

// Défilement explicite pour que le bouton fonctionne aussi sur les navigateurs qui gèrent mal l'ancre d'un header fixe.
document.querySelector('.back-top').addEventListener('click', (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
