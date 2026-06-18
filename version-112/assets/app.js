(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      const isOpen = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    const section = panel.closest(".section") || document;
    const list = section.querySelector("[data-filter-list]");
    const emptyState = section.querySelector("[data-empty-state]");

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll(".movie-card"));
    const searchInput = panel.querySelector("[data-search-input]");
    const regionSelect = panel.querySelector("[data-region-select]");
    const yearSelect = panel.querySelector("[data-year-select]");

    function fillSelect(select, values) {
      if (!select) {
        return;
      }

      Array.from(new Set(values.filter(Boolean))).sort().forEach(function (value) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(regionSelect, cards.map(function (card) {
      return card.dataset.region || "";
    }));

    fillSelect(yearSelect, cards.map(function (card) {
      return card.dataset.year || "";
    }));

    function update() {
      const query = (searchInput && searchInput.value ? searchInput.value : "").trim().toLowerCase();
      const region = regionSelect ? regionSelect.value : "";
      const year = yearSelect ? yearSelect.value : "";
      let visible = 0;

      cards.forEach(function (card) {
        const text = (card.dataset.filterText || "").toLowerCase();
        const matchedQuery = !query || text.indexOf(query) !== -1;
        const matchedRegion = !region || card.dataset.region === region;
        const matchedYear = !year || card.dataset.year === year;
        const matched = matchedQuery && matchedRegion && matchedYear;

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    [searchInput, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });
  });
})();
