(function () {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var form = document.querySelector('[data-search-form]');
    var input = form ? form.querySelector('input[name="q"]') : null;
    var results = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-search-empty]');
    var movies = window.siteMovies || [];

    if (input) {
        input.value = query;
    }

    function clean(text) {
        return String(text || '').toLowerCase();
    }

    function escapeHtml(text) {
        return String(text || '').replace(/[&<>"]/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[character];
        });
    }

    function createCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        var title = escapeHtml(movie.title);
        var oneLine = escapeHtml(movie.oneLine);
        var region = escapeHtml(movie.region);
        var duration = escapeHtml(movie.duration);

        return [
            '<article class="movie-card">',
            '<a href="./movies/movie-' + movie.id + '.html" class="movie-card-link">',
            '<figure class="movie-poster">',
            '<img src="./' + movie.cover + '.jpg" alt="' + title + '" loading="lazy">',
            '<figcaption>' + duration + '</figcaption>',
            '</figure>',
            '<div class="movie-card-body">',
            '<h3>' + title + '</h3>',
            '<p>' + oneLine + '</p>',
            '<div class="movie-meta-row"><span>' + region + '</span><span>' + movie.year + '</span></div>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    }

    function render() {
        if (!results) {
            return;
        }

        var keyword = clean(query).trim();
        var output = movies.filter(function (movie) {
            if (!keyword) {
                return false;
            }

            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.genre,
                movie.oneLine,
                (movie.tags || []).join(' ')
            ].map(clean).join(' ');

            return haystack.indexOf(keyword) !== -1;
        }).slice(0, 96);

        results.innerHTML = output.map(createCard).join('');

        if (empty) {
            empty.hidden = output.length !== 0 || !keyword;
        }
    }

    render();
})();
