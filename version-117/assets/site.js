const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const basePath = document.body?.dataset?.base || './';

function resolvePath(path) {
  if (!path) {
    return basePath;
  }
  if (/^(https?:)?\/\//.test(path) || path.startsWith('/')) {
    return path;
  }
  return basePath + path;
}

function setHidden(element, hidden) {
  if (!element) {
    return;
  }
  if (hidden) {
    element.setAttribute('hidden', '');
  } else {
    element.removeAttribute('hidden');
  }
}

function initNavigation() {
  const toggle = qs('[data-nav-toggle]');
  const panel = qs('[data-mobile-panel]');
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener('click', () => {
    const shouldOpen = panel.hasAttribute('hidden');
    setHidden(panel, !shouldOpen);
    toggle.textContent = shouldOpen ? '×' : '☰';
  });
}

function initHero() {
  const hero = qs('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = qsa('[data-hero-slide]', hero);
  const dots = qsa('[data-hero-dot]', hero);
  const prev = qs('[data-hero-prev]', hero);
  const next = qs('[data-hero-next]', hero);
  if (!slides.length) {
    return;
  }
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  const restart = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(current + 1), 5000);
  };

  prev?.addEventListener('click', () => {
    show(current - 1);
    restart();
  });
  next?.addEventListener('click', () => {
    show(current + 1);
    restart();
  });
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || 0));
      restart();
    });
  });
  show(0);
  restart();
}

function initSearch() {
  const panel = qs('[data-search-panel]');
  const input = qs('[data-global-search]');
  const results = qs('[data-global-search-results]');
  const openButtons = qsa('[data-search-open]');
  const closeButtons = qsa('[data-search-close]');
  const index = window.MOVIE_SEARCH_INDEX || [];

  if (!panel || !input || !results) {
    return;
  }

  const open = () => {
    setHidden(panel, false);
    window.setTimeout(() => input.focus(), 30);
  };

  const close = () => {
    setHidden(panel, true);
    input.value = '';
    results.innerHTML = '';
  };

  const createResult = (movie) => {
    const link = document.createElement('a');
    link.className = 'search-result';
    link.href = resolvePath(movie.url);

    const img = document.createElement('img');
    img.src = resolvePath(movie.cover);
    img.alt = movie.title;
    img.loading = 'lazy';

    const body = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = movie.title;
    const meta = document.createElement('span');
    meta.textContent = `${movie.year} · ${movie.region} · ${movie.genre}`;
    const summary = document.createElement('small');
    summary.textContent = movie.summary || '';

    body.append(title, meta, summary);
    link.append(img, body);
    return link;
  };

  const render = () => {
    const query = input.value.trim().toLowerCase();
    results.innerHTML = '';
    if (!query) {
      return;
    }
    const matched = index.filter((movie) => {
      const haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.summary,
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    }).slice(0, 18);

    if (!matched.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = '没有找到匹配影片。';
      results.append(empty);
      return;
    }
    matched.forEach((movie) => results.append(createResult(movie)));
  };

  openButtons.forEach((button) => button.addEventListener('click', open));
  closeButtons.forEach((button) => button.addEventListener('click', close));
  input.addEventListener('input', render);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const first = qs('.search-result', results);
      if (first) {
        window.location.href = first.href;
      }
    }
    if (event.key === 'Escape') {
      close();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hasAttribute('hidden')) {
      close();
    }
  });
}

function initLocalFilters() {
  qsa('[data-filter-scope]').forEach((scope) => {
    const input = qs('[data-filter-input]', scope);
    const year = qs('[data-filter-year]', scope);
    const region = qs('[data-filter-region]', scope);
    const count = qs('[data-filter-count]', scope);
    const empty = qs('[data-filter-empty]', scope);
    const cards = qsa('[data-card]', scope);

    const apply = () => {
      const q = (input?.value || '').trim().toLowerCase();
      const selectedYear = year?.value || '';
      const selectedRegion = region?.value || '';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags,
        ].join(' ').toLowerCase();
        const matchesText = !q || haystack.includes(q);
        const matchesYear = !selectedYear || card.dataset.year === selectedYear;
        const matchesRegion = !selectedRegion || card.dataset.region === selectedRegion;
        const show = matchesText && matchesYear && matchesRegion;
        setHidden(card, !show);
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = `${visible} 部影片`;
      }
      setHidden(empty, visible !== 0);
    };

    input?.addEventListener('input', apply);
    year?.addEventListener('change', apply);
    region?.addEventListener('change', apply);
    apply();
  });
}

async function attachHls(video, sourceUrl, status) {
  if (video.dataset.bound === '1') {
    return;
  }
  video.dataset.bound = '1';

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = sourceUrl;
    status.textContent = '已使用浏览器原生 HLS 播放能力加载播放源。';
    return;
  }

  try {
    const module = await import('./video-vendor.js');
    const Hls = module.H || module.default;
    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30,
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      status.textContent = '已通过本地 HLS 模块初始化 m3u8 播放源。';
      return;
    }
  } catch (error) {
    console.warn('HLS module initialization failed:', error);
  }

  video.src = sourceUrl;
  status.textContent = '播放器已绑定播放源；如果当前浏览器不支持 HLS，请使用支持 HLS 的浏览器访问。';
}

function initPlayers() {
  qsa('[data-player]').forEach((player) => {
    const video = qs('video[data-video-src]', player);
    const button = qs('[data-play-button]', player);
    const status = qs('[data-player-status]', player) || document.createElement('p');
    if (!video || !button) {
      return;
    }
    const sourceUrl = video.dataset.videoSrc;

    button.addEventListener('click', async () => {
      await attachHls(video, sourceUrl, status);
      try {
        await video.play();
        setHidden(button, true);
      } catch (error) {
        status.textContent = '浏览器阻止了自动播放，请再次点击视频控件播放。';
      }
    });

    video.addEventListener('play', () => setHidden(button, true));
    video.addEventListener('pause', () => {
      if (video.currentTime === 0 || video.ended) {
        setHidden(button, false);
      }
    });
    video.addEventListener('error', () => {
      status.textContent = '播放源加载失败，请刷新页面或更换浏览器再试。';
      setHidden(button, false);
    });
  });

  qsa('[data-scroll-player]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const player = qs('[data-player]');
      player?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      qs('[data-play-button]', player)?.focus();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHero();
  initSearch();
  initLocalFilters();
  initPlayers();
});
