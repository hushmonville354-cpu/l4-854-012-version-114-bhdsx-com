(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var timer = null;

    var show = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    var start = function () {
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }
    };

    var stop = function () {
      if (timer) {
        window.clearInterval(timer);
      }
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        stop();
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  var filterScopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

  filterScopes.forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-filter-year]');
    var list = scope.parentElement.querySelector('[data-filter-list]');

    if (!input || !list) {
      return;
    }

    if (initialQuery && !input.value) {
      input.value = initialQuery;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    var runFilter = function () {
      var keyword = input.value.trim().toLowerCase();
      var selectedYear = year ? year.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        card.dataset.hidden = matchKeyword && matchYear ? 'false' : 'true';
      });
    };

    input.addEventListener('input', runFilter);

    if (year) {
      year.addEventListener('change', runFilter);
    }

    runFilter();
  });

  var player = document.querySelector('[data-player]');
  var button = document.querySelector('[data-play]');

  if (player && button) {
    var sourceUrl = button.getAttribute('data-video-url');
    var hlsInstance = null;
    var loaded = false;

    var markReady = function () {
      button.classList.add('is-hidden');
    };

    var playVideo = function () {
      var requestPlay = function () {
        var promise = player.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      };

      if (!sourceUrl) {
        return;
      }

      if (!loaded) {
        loaded = true;

        if (player.canPlayType('application/vnd.apple.mpegurl')) {
          player.src = sourceUrl;
          player.addEventListener('loadedmetadata', requestPlay, { once: true });
          requestPlay();
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(sourceUrl);
          hlsInstance.attachMedia(player);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, requestPlay);
        }
      } else {
        requestPlay();
      }

      markReady();
    };

    button.addEventListener('click', playVideo);
    player.addEventListener('play', markReady);
    player.addEventListener('click', function () {
      if (player.paused) {
        playVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
