(() => {
  const form = document.querySelector('[data-search-form]');
  const input = form?.querySelector('input[name="q"]');
  const results = document.querySelector('[data-search-results]');
  const title = document.querySelector('[data-search-title]');

  if (!form || !input || !results) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  input.value = initialQuery;

  const normalize = (value) => String(value || '').toLowerCase().trim();

  const renderCard = (movie) => {
    const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `
<article class="movie-card compact-card">
  <a class="poster-link" href="${movie.url}">
    <img src="${movie.image}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span class="poster-badge">${escapeHtml(movie.type)}</span>
  </a>
  <div class="movie-card-body">
    <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
    <p>${escapeHtml(movie.oneLine || movie.summary || '')}</p>
    <div class="card-meta">
      <span>${movie.year}</span>
      <span>${escapeHtml(movie.region)}</span>
      <span>${escapeHtml(movie.duration)}</span>
    </div>
    <div class="tag-row">${tags}</div>
  </div>
</article>`;
  };

  const escapeHtml = (value) => String(value || '').replace(/[&<>"]/g, (char) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    };
    return map[char];
  });

  const runSearch = (movies, query) => {
    const normalizedQuery = normalize(query);
    const filtered = normalizedQuery
      ? movies.filter((movie) => {
          const haystack = [
            movie.title,
            movie.year,
            movie.region,
            movie.type,
            movie.genre,
            movie.category,
            movie.oneLine,
            movie.summary,
            ...(movie.tags || [])
          ].join(' ').toLowerCase();
          return haystack.includes(normalizedQuery);
        })
      : movies.slice(0, 48);

    const visible = filtered.slice(0, 96);
    results.innerHTML = visible.map(renderCard).join('');

    if (title) {
      title.textContent = normalizedQuery ? `“${query}” 的搜索结果` : '推荐浏览';
    }
  };

  fetch('data/search-index.json')
    .then((response) => response.json())
    .then((movies) => {
      runSearch(movies, initialQuery);

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = input.value.trim();
        const url = query ? `search.html?q=${encodeURIComponent(query)}` : 'search.html';
        window.history.replaceState(null, '', url);
        runSearch(movies, query);
      });

      input.addEventListener('input', () => {
        runSearch(movies, input.value.trim());
      });
    });
})();
