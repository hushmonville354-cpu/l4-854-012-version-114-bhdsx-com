(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-nav]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var previous = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    if (!slides.length) {
      return;
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function initSearchAndFilters() {
    var scopes = qsa('[data-filter-scope]');
    scopes.forEach(function (scope) {
      var input = qs('[data-search-input]', scope);
      var buttons = qsa('[data-filter-button]', scope);
      var cards = qsa('[data-movie-card]', scope);
      var empty = qs('[data-empty-state]', scope);
      var activeFilter = '全部';

      function applyFilter() {
        var query = normalize(input ? input.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesFilter = activeFilter === '全部' || haystack.indexOf(normalize(activeFilter)) !== -1;
          var shouldShow = matchesQuery && matchesFilter;
          card.style.display = shouldShow ? '' : 'none';
          if (shouldShow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeFilter = button.getAttribute('data-filter-button') || '全部';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          applyFilter();
        });
      });

      applyFilter();
    });
  }

  function setupVideo(video, src) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return null;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return hls;
    }
    video.src = src;
    return null;
  }

  function initPlayers() {
    var players = qsa('[data-player]');
    players.forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-play-button]', player);
      var src = player.getAttribute('data-stream');
      var prepared = false;
      var hlsInstance = null;

      if (!video || !button || !src) {
        return;
      }

      function prepare() {
        if (prepared) {
          return;
        }
        hlsInstance = setupVideo(video, src);
        prepared = true;
      }

      function startPlayback() {
        prepare();
        player.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      button.addEventListener('click', startPlayback);
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroSlider();
    initSearchAndFilters();
    initPlayers();
  });
}());
