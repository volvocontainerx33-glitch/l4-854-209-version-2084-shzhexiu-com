function ready(callback) {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
}

ready(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.dot-btn'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        schedule();
      });
    }

    show(0);
    schedule();
  });

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var search = root.querySelector('[data-filter-search]');
    var genre = root.querySelector('[data-filter-genre]');
    var region = root.querySelector('[data-filter-region]');
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-filter-item]'));

    function filter() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var g = genre ? genre.value : '';
      var r = region ? region.value : '';
      items.forEach(function (item) {
        var hay = [
          item.getAttribute('data-title'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-region'),
          item.getAttribute('data-tags'),
          item.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var okSearch = !q || hay.indexOf(q) !== -1;
        var okGenre = !g || (item.getAttribute('data-genre') || '').indexOf(g) !== -1;
        var okRegion = !r || (item.getAttribute('data-region') || '').indexOf(r) !== -1;
        item.classList.toggle('hide', !(okSearch && okGenre && okRegion));
      });
    }

    [search, genre, region].forEach(function (field) {
      if (field) {
        field.addEventListener('input', filter);
        field.addEventListener('change', filter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && search) {
      search.value = query;
    }
    filter();
  });

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-player-play]');
    var attached = false;

    function attach() {
      if (attached || !video) return;
      var source = video.getAttribute('data-src');
      if (!source) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.hls = hls;
      } else {
        video.src = source;
      }
      attached = true;
    }

    function play() {
      attach();
      if (!video) return;
      video.controls = true;
      box.classList.add('is-playing');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          video.controls = true;
          box.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    box.addEventListener('click', function (event) {
      if (event.target === box || event.target.classList.contains('player-overlay')) {
        play();
      }
    });
  });
});
