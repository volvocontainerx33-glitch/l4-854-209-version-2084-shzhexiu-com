(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-nav-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        restart();
    }

    var panelFilter = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-filter-list]');

    if (panelFilter && list) {
        var input = panelFilter.querySelector('[data-list-search]');
        var cards = Array.prototype.slice.call(list.children);
        var empty = document.querySelector('[data-empty-state]');
        var original = cards.slice();

        function textOf(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-genre')
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var match = !keyword || textOf(card).indexOf(keyword) !== -1;
                card.hidden = !match;
                if (match) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        function applySort(mode) {
            var sorted = cards.slice();

            if (mode === 'year') {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                });
            } else if (mode === 'hot') {
                sorted.reverse();
            } else {
                sorted = original.slice();
            }

            sorted.forEach(function (card) {
                list.appendChild(card);
            });

            cards = sorted;
            applyFilter();
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        panelFilter.querySelectorAll('[data-sort]').forEach(function (button) {
            button.addEventListener('click', function () {
                applySort(button.getAttribute('data-sort'));
            });
        });
    }
})();
