(function () {
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.querySelector(".site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var opened = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function restartSlider() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        restartSlider();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restartSlider();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restartSlider();
      });
    }

    restartSlider();
  }

  var filterList = document.querySelector("[data-filter-list]");

  if (filterList) {
    var searchInput = document.querySelector(".js-search");
    var regionSelect = document.querySelector(".js-region");
    var yearSelect = document.querySelector(".js-year");
    var typeSelect = document.querySelector(".js-type");
    var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : "";
    }

    function filterCards() {
      var keyword = valueOf(searchInput);
      var region = valueOf(regionSelect);
      var year = valueOf(yearSelect);
      var type = valueOf(typeSelect);

      cards.forEach(function (card) {
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
        var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
        var cardType = (card.getAttribute("data-type") || "").toLowerCase();
        var tags = (card.getAttribute("data-tags") || "").toLowerCase();
        var haystack = title + " " + cardRegion + " " + cardYear + " " + cardType + " " + tags;
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }

        card.hidden = !matched;
      });
    }

    [searchInput, regionSelect, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });
  }
})();
