function getQuery(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || '';
}

function setupMobileNav() {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.mobile-nav');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', function () {
    nav.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  const root = document.querySelector('[data-hero-carousel]');
  if (!root) {
    return;
  }
  const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
  if (!slides.length) {
    return;
  }
  let active = 0;
  function show(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      show(i);
    });
  });
  window.setInterval(function () {
    show(active + 1);
  }, 5200);
}

function setupCardFilter() {
  const input = document.querySelector('.js-filter-input');
  const grid = document.querySelector('[data-filter-grid]');
  if (!input || !grid) {
    return;
  }
  const cards = Array.from(grid.querySelectorAll('.movie-card'));
  input.addEventListener('input', function () {
    const query = input.value.trim().toLowerCase();
    cards.forEach(function (card) {
      const haystack = [
        card.dataset.title || '',
        card.dataset.genre || '',
        card.dataset.tags || '',
        card.dataset.region || ''
      ].join(' ').toLowerCase();
      card.classList.toggle('is-filtered-out', query && !haystack.includes(query));
    });
  });
}

function cardTemplate(movie) {
  const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
    return '<span>' + escapeHtml(tag) + '</span>';
  }).join('');
  return [
    '<a class="movie-card movie-card-compact" href="' + movie.url + '">',
    '  <span class="poster-wrap">',
    '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
    '    <span class="card-badge">' + escapeHtml(movie.region) + '</span>',
    '    <span class="card-year">' + escapeHtml(movie.year) + '</span>',
    '    <span class="card-play">播放</span>',
    '  </span>',
    '  <span class="card-body">',
    '    <strong>' + escapeHtml(movie.title) + '</strong>',
    '    <span class="card-meta">' + escapeHtml(movie.genre) + '</span>',
    '    <span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>',
    '    <span class="tag-row">' + tags + '</span>',
    '  </span>',
    '</a>'
  ].join('');
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, function (char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char];
  });
}

function setupSearchPage() {
  const input = document.getElementById('searchPageInput');
  const results = document.getElementById('searchResults');
  const summary = document.getElementById('searchSummary');
  if (!input || !results || !summary || !window.SEARCH_INDEX) {
    return;
  }
  const query = getQuery('q').trim();
  if (query) {
    input.value = query;
    renderSearch(query);
  }
  input.addEventListener('input', function () {
    renderSearch(input.value.trim());
  });
  function renderSearch(value) {
    if (!value) {
      summary.textContent = '热门推荐';
      return;
    }
    const q = value.toLowerCase();
    const matched = window.SEARCH_INDEX.filter(function (movie) {
      return [movie.title, movie.region, movie.genre, movie.year, movie.oneLine].concat(movie.tags || []).join(' ').toLowerCase().includes(q);
    });
    summary.textContent = matched.length ? '搜索结果' : '暂无匹配影片';
    results.innerHTML = matched.map(cardTemplate).join('');
  }
}

function initMoviePlayer(source) {
  const video = document.querySelector('.movie-video');
  const overlay = document.querySelector('.play-overlay');
  if (!video || !overlay || !source) {
    return;
  }
  let ready = false;
  let hlsInstance = null;
  function attach() {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = source;
  }
  function play() {
    attach();
    overlay.classList.add('is-hidden');
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }
  overlay.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

window.initMoviePlayer = initMoviePlayer;

document.addEventListener('DOMContentLoaded', function () {
  setupMobileNav();
  setupHeroCarousel();
  setupCardFilter();
  setupSearchPage();
});
