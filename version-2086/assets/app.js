(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5600);
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

      function applyFilter() {
        var text = input ? input.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-region") || ""
          ].join(" ").toLowerCase();
          var matchedText = !text || haystack.indexOf(text) !== -1;
          var matchedYear = !year || card.getAttribute("data-year") === year;
          var matchedRegion = !region || card.getAttribute("data-region") === region;
          card.style.display = matchedText && matchedYear && matchedRegion ? "" : "none";
        });
      }

      [input, yearSelect, regionSelect].forEach(function (node) {
        if (node) {
          node.addEventListener("input", applyFilter);
          node.addEventListener("change", applyFilter);
        }
      });
    });

    Array.prototype.slice.call(document.querySelectorAll(".player-wrap")).forEach(function (wrap) {
      var video = wrap.querySelector("video");
      var overlay = wrap.querySelector(".player-overlay");
      var streamUrl = video ? video.getAttribute("data-stream") : "";
      var attached = false;

      function attachStream() {
        if (!video || !streamUrl || attached) {
          return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function start() {
        attachStream();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        if (video) {
          video.setAttribute("controls", "controls");
          var playback = video.play();
          if (playback && typeof playback.catch === "function") {
            playback.catch(function () {});
          }
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
      }
    });
  });
})();
