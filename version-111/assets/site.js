(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var backgrounds = Array.prototype.slice.call(root.querySelectorAll("[data-hero-bg]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      backgrounds.forEach(function (background, itemIndex) {
        background.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var value = parseInt(dot.getAttribute("data-hero-dot"), 10);
        if (!Number.isNaN(value)) {
          show(value);
          start();
        }
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var section = panel.closest("section") || document;
      var grid = section.querySelector("[data-filter-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".filter-card"));
      var keyword = panel.querySelector("[data-filter-keyword]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var sort = panel.querySelector("[data-filter-sort]");
      var reset = panel.querySelector("[data-filter-reset]");
      var status = section.querySelector("[data-filter-status]");
      var original = cards.slice();

      function textOf(card) {
        return [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.querySelector("h3") ? card.querySelector("h3").textContent : "",
          card.querySelector("p") ? card.querySelector("p").textContent : ""
        ].join(" ").toLowerCase();
      }

      function apply() {
        var term = keyword ? keyword.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var sortValue = sort ? sort.value : "default";
        var visible = cards.filter(function (card) {
          var okTerm = !term || textOf(card).indexOf(term) !== -1;
          var okRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          var okType = !typeValue || card.getAttribute("data-type") === typeValue;
          return okTerm && okRegion && okType;
        });

        cards.forEach(function (card) {
          card.classList.toggle("is-hidden", visible.indexOf(card) === -1);
        });

        var sorted = visible.slice();
        if (sortValue === "popular") {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
          });
        } else if (sortValue === "latest") {
          sorted.sort(function (a, b) {
            return String(b.getAttribute("data-date")).localeCompare(String(a.getAttribute("data-date")));
          });
        } else if (sortValue === "year") {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          });
        } else {
          sorted = original.filter(function (card) {
            return visible.indexOf(card) !== -1;
          });
        }
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
        if (status) {
          status.textContent = visible.length ? "已显示匹配影片" : "未找到匹配影片";
        }
      }

      [keyword, region, type, sort].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      if (reset) {
        reset.addEventListener("click", function () {
          if (keyword) keyword.value = "";
          if (region) region.value = "";
          if (type) type.value = "";
          if (sort) sort.value = "default";
          apply();
        });
      }
      apply();
    });
  }

  function setupSearch() {
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !window.MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }
    if (!query.trim()) {
      return;
    }
    var term = query.trim().toLowerCase();
    var matches = window.MOVIES.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.summary]
        .join(" ")
        .toLowerCase()
        .indexOf(term) !== -1;
    }).slice(0, 180);
    results.innerHTML = "";
    if (summary) {
      summary.textContent = matches.length ? "搜索结果" : "未找到相关影片";
    }
    if (!matches.length) {
      var empty = document.createElement("div");
      empty.className = "side-card";
      empty.innerHTML = "<h2>暂无结果</h2><p>可以尝试更换片名、地区、年份或类型关键词。</p>";
      results.appendChild(empty);
      return;
    }
    matches.forEach(function (movie) {
      var card = document.createElement("article");
      card.className = "movie-card";
      card.innerHTML = [
        "<a href=\"" + movie.path + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
        "<div class=\"poster-wrap\">",
        "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
        "<span class=\"movie-badge\">" + escapeHtml(movie.category) + "</span>",
        "<span class=\"movie-duration\">" + escapeHtml(movie.duration) + "</span>",
        "</div>",
        "<div class=\"movie-info\">",
        "<h3>" + escapeHtml(movie.title) + "</h3>",
        "<p>" + escapeHtml(movie.oneLine) + "</p>",
        "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
        "</div>",
        "</a>"
      ].join("");
      results.appendChild(card);
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".video-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-mask");
      var errorBox = player.querySelector(".player-error");
      var stream = player.getAttribute("data-video");
      var readyState = false;
      var hls = null;
      if (!video || !button || !stream) {
        return;
      }

      function showError() {
        if (errorBox) {
          errorBox.classList.add("is-visible");
        }
        button.classList.remove("is-hidden");
      }

      function prepare() {
        if (readyState) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          readyState = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              showError();
            }
          });
          readyState = true;
          return;
        }
        video.src = stream;
        readyState = true;
      }

      function play() {
        button.classList.add("is-hidden");
        if (errorBox) {
          errorBox.classList.remove("is-visible");
        }
        prepare();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("error", showError);
      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearch();
    setupPlayers();
  });
})();
