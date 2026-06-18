(function () {
  'use strict';

  var currentScript = document.currentScript;
  var assetBase = currentScript && currentScript.src ? new URL('.', currentScript.src).href : './assets/';

  function rootPrefix() {
    var path = window.location.pathname;
    if (path.indexOf('/video/') !== -1 || path.indexOf('/category/') !== -1) {
      return '../';
    }
    return '';
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-nav-links]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    restart();
  }

  function matchesRegion(value, region) {
    if (!value) {
      return true;
    }
    var haystack = region || '';
    if (value === '欧美') {
      return /欧美|美国|英国|法国|德国|意大利|西班牙|荷兰|瑞典|挪威|丹麦|芬兰|爱尔兰|加拿大|澳大利亚|比利时|瑞士|奥地利|欧洲|好莱坞/.test(haystack);
    }
    if (value === '中国') {
      return /中国|国产|内地|香港|台湾/.test(haystack);
    }
    return haystack.indexOf(value) !== -1;
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-filter-list]');
    if (!panel || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var keyword = panel.querySelector('[data-filter-keyword]');
    var region = panel.querySelector('[data-filter-region]');
    var genre = panel.querySelector('[data-filter-genre]');
    var year = panel.querySelector('[data-filter-year]');
    var count = panel.querySelector('[data-filter-count]');
    var empty = document.querySelector('[data-filter-empty]');

    function apply() {
      var key = (keyword && keyword.value || '').trim().toLowerCase();
      var regionValue = region && region.value || '';
      var genreValue = genre && genre.value || '';
      var yearValue = year && year.value || '';
      var visible = 0;

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var cardRegion = card.getAttribute('data-region') || '';
        var cardGenre = card.getAttribute('data-genre') || '';
        var cardTags = card.getAttribute('data-tags') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var haystack = [title, cardRegion, cardGenre, cardTags, cardYear].join(' ').toLowerCase();
        var ok = true;

        if (key && haystack.indexOf(key) === -1) {
          ok = false;
        }
        if (!matchesRegion(regionValue, cardRegion + cardTags)) {
          ok = false;
        }
        if (genreValue && (cardGenre + cardTags).indexOf(genreValue) === -1) {
          ok = false;
        }
        if (yearValue && cardYear !== yearValue) {
          ok = false;
        }

        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keyword, region, genre, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function createMovieCard(movie) {
    var prefix = rootPrefix();
    var href = prefix + 'video/' + movie.id + '.html';
    var cover = prefix + movie.cover;
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="' + href + '">',
      '  <span class="poster-frame">',
      '    <img src="' + cover + '" alt="' + escapeHtml(movie.title) + '海报" loading="lazy">',
      '    <span class="rating-badge">★ ' + escapeHtml(movie.rating) + '</span>',
      '    <span class="play-badge">▶</span>',
      '  </span>',
      '  <span class="movie-card-body">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <span class="movie-meta">' + movie.year + ' · ' + escapeHtml(movie.region) + '</span>',
      '    <span class="movie-tags">' + tags + '</span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var meta = document.querySelector('[data-search-meta]');
    if (!form || !input || !results || !meta || !window.MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function runSearch() {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        results.innerHTML = '';
        meta.textContent = '请输入关键词开始搜索。';
        return;
      }
      var matches = window.MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genreRaw,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();
        return haystack.indexOf(query) !== -1;
      }).slice(0, 120);

      results.innerHTML = matches.map(createMovieCard).join('');
      meta.textContent = '找到 ' + matches.length + ' 条匹配结果' + (matches.length >= 120 ? '，已显示前 120 条。' : '。');
      bindImageFallbacks(results);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch();
      var nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('q', input.value.trim());
      window.history.replaceState(null, '', nextUrl.toString());
    });
    input.addEventListener('input', runSearch);
    runSearch();
  }

  function bindImageFallbacks(root) {
    var scope = root || document;
    var images = Array.prototype.slice.call(scope.querySelectorAll('img'));
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('media-error');
      }, { once: true });
    });
  }

  function loadHlsConstructor() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    return import(assetBase + 'video-vendor.js').then(function (module) {
      return module.H;
    }).catch(function () {
      return null;
    });
  }

  function initPlayers() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('video.js-hls-player'));
    if (!videos.length) {
      return;
    }

    loadHlsConstructor().then(function (Hls) {
      videos.forEach(function (video) {
        var src = video.getAttribute('data-src');
        var shell = video.closest('.player-shell');
        var overlay = shell && shell.querySelector('.player-overlay');
        var message = shell && shell.querySelector('[data-player-message]');

        if (!src) {
          return;
        }

        if (Hls && Hls.isSupported && Hls.isSupported()) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal && message) {
              message.textContent = '播放源加载失败，请稍后重试。';
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (message) {
          message.textContent = '当前浏览器不支持 HLS 播放。';
        }

        if (overlay) {
          overlay.addEventListener('click', function () {
            video.play().catch(function () {
              if (message) {
                message.textContent = '浏览器阻止了自动播放，请使用播放器控制栏播放。';
              }
            });
          });
          video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
          });
          video.addEventListener('pause', function () {
            if (!video.ended) {
              overlay.classList.remove('is-hidden');
            }
          });
          video.addEventListener('ended', function () {
            overlay.classList.remove('is-hidden');
          });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
    bindImageFallbacks(document);
  });
})();
