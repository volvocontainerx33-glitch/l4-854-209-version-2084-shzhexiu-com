(function () {
  function rootPath() {
    return document.body.getAttribute("data-root") || "./";
  }

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var toggle = qs("[data-mobile-toggle]");
    var panel = qs("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
    });
  }

  function initSearchForms() {
    qsa(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = qs("input", form);
        var query = input ? input.value.trim() : "";
        var target = rootPath() + "search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function initHero() {
    var slider = qs("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = qsa(".hero-slide", slider);
    var dots = qsa(".hero-dot", slider);
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        activate((index + 1) % slides.length);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        stop();
        activate(itemIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function initPageFilters() {
    var panel = qs("[data-filter-panel]");
    var grid = qs("[data-card-grid]");
    if (!panel || !grid) {
      return;
    }
    var keywordInput = qs("[data-filter-keyword]", panel);
    var regionSelect = qs("[data-filter-region]", panel);
    var yearSelect = qs("[data-filter-year]", panel);
    var empty = qs("[data-filter-empty]");
    var cards = qsa(".movie-card", grid);

    function apply() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      var region = regionSelect ? regionSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var cardRegion = card.getAttribute("data-region") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (region && cardRegion.indexOf(region) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [keywordInput, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function createResultCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      '<a class="movie-link" href="' + movie.link + '">',
      '<span class="poster">',
      '<span class="poster-badge">' + movie.year + '</span>',
      '<img src="' + movie.image + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
      '</span>',
      '<span class="movie-info">',
      '<strong class="movie-title">' + movie.title + '</strong>',
      '<span class="movie-meta"><span>' + movie.region + '</span><span>' + movie.genre + '</span></span>',
      '<span class="movie-line">' + movie.one_line + '</span>',
      '</span>',
      '</a>'
    ].join("");
    return article;
  }

  function initSearchPage() {
    var resultGrid = qs("[data-search-results]");
    if (!resultGrid || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = qs("[data-search-page-input]");
    var title = qs("[data-search-title]");
    var empty = qs("[data-search-empty]");
    if (input) {
      input.value = query;
      input.addEventListener("input", function () {
        render(input.value.trim());
      });
    }

    function render(value) {
      var keyword = value.toLowerCase();
      var results = window.SITE_MOVIES.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        return movie.search.indexOf(keyword) !== -1;
      }).slice(0, 240);
      resultGrid.innerHTML = "";
      results.forEach(function (movie) {
        resultGrid.appendChild(createResultCard(movie));
      });
      if (title) {
        title.textContent = value ? "搜索：" + value : "搜索影片";
      }
      if (empty) {
        empty.classList.toggle("is-visible", results.length === 0);
      }
    }

    render(query);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initSearchForms();
    initHero();
    initPageFilters();
    initSearchPage();
  });
})();
