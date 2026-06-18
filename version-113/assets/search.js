(function () {
  var movies = window.SearchMovies || [];
  var categories = window.SearchCategories || [];
  var input = document.getElementById('search-input');
  var region = document.getElementById('search-region');
  var year = document.getElementById('search-year');
  var category = document.getElementById('search-category');
  var sort = document.getElementById('search-sort');
  var results = document.getElementById('search-results');
  var empty = document.getElementById('search-empty');

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function unique(list, field) {
    var seen = {};
    return list.map(function (item) {
      return item[field] || '';
    }).filter(function (value) {
      if (!value || seen[value]) {
        return false;
      }
      seen[value] = true;
      return true;
    }).sort();
  }

  function option(value, label) {
    var node = document.createElement('option');
    node.value = value;
    node.textContent = label;
    return node;
  }

  function fillOptions() {
    unique(movies, 'region').forEach(function (value) {
      region.appendChild(option(value, value));
    });
    unique(movies, 'year').reverse().forEach(function (value) {
      year.appendChild(option(value, value));
    });
    categories.forEach(function (item) {
      category.appendChild(option(item.slug, item.name));
    });
  }

  function makeText(parts) {
    return parts.filter(Boolean).join(' · ');
  }

  function makeCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';

    var link = document.createElement('a');
    link.className = 'poster-link';
    link.href = movie.url;

    var image = document.createElement('img');
    image.src = movie.cover;
    image.alt = movie.title;
    image.loading = 'lazy';
    link.appendChild(image);

    var badge = document.createElement('span');
    badge.className = 'poster-badge';
    badge.textContent = movie.categoryName;
    link.appendChild(badge);

    var body = document.createElement('div');
    body.className = 'movie-card-body';

    var meta = document.createElement('div');
    meta.className = 'movie-meta';
    meta.textContent = makeText([movie.year, movie.region, movie.type]);

    var title = document.createElement('h3');
    var titleLink = document.createElement('a');
    titleLink.href = movie.url;
    titleLink.textContent = movie.title;
    title.appendChild(titleLink);

    var intro = document.createElement('p');
    intro.textContent = movie.oneLine;

    var tags = document.createElement('div');
    tags.className = 'tag-row';
    movie.tags.slice(0, 3).forEach(function (tag) {
      var chip = document.createElement('span');
      chip.textContent = tag;
      tags.appendChild(chip);
    });

    body.appendChild(meta);
    body.appendChild(title);
    body.appendChild(intro);
    body.appendChild(tags);
    article.appendChild(link);
    article.appendChild(body);
    return article;
  }

  function render() {
    if (!results) {
      return;
    }
    var query = (input.value || '').trim().toLowerCase();
    var selectedRegion = region.value;
    var selectedYear = year.value;
    var selectedCategory = category.value;
    var filtered = movies.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.genre, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase();
      return (!query || text.indexOf(query) !== -1)
        && (!selectedRegion || movie.region === selectedRegion)
        && (!selectedYear || movie.year === selectedYear)
        && (!selectedCategory || movie.category === selectedCategory);
    });

    if (sort.value === 'year') {
      filtered.sort(function (a, b) {
        return Number(b.year || 0) - Number(a.year || 0);
      });
    } else if (sort.value === 'title') {
      filtered.sort(function (a, b) {
        return a.title.localeCompare(b.title, 'zh-CN');
      });
    } else {
      filtered.sort(function (a, b) {
        return b.heat - a.heat;
      });
    }

    results.innerHTML = '';
    filtered.slice(0, 120).forEach(function (movie) {
      results.appendChild(makeCard(movie));
    });
    empty.classList.toggle('is-visible', filtered.length === 0);
  }

  if (input && region && year && category && sort && results && empty) {
    fillOptions();
    input.value = getParam('q');
    [input, region, year, category, sort].forEach(function (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    });
    render();
  }
})();
