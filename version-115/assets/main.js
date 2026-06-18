(() => {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const siteNav = document.querySelector('[data-site-nav]');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      siteNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const showSlide = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => showSlide(dotIndex));
    });

    if (slides.length > 1) {
      window.setInterval(() => showSlide(index + 1), 5200);
    }
  }

  document.querySelectorAll('[data-local-filter]').forEach((form) => {
    const input = form.querySelector('input');
    const list = document.querySelector('[data-filter-list]');

    if (!input || !list) {
      return;
    }

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      const cards = Array.from(list.querySelectorAll('.movie-card'));

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title || '',
          card.dataset.genre || '',
          card.dataset.region || '',
          card.dataset.year || ''
        ].join(' ').toLowerCase();
        card.classList.toggle('is-hidden-by-filter', query && !haystack.includes(query));
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
    });
  });
})();
