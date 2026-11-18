/* CinemaHub - TVMaze API layer */
(function (window) {
    'use strict';

    var API_BASE = 'https://api.tvmaze.com';
    var REQUEST_TIMEOUT = 12000;

    window.CinemaHub = window.CinemaHub || {};

    /* fetch() wrapper with a timeout */
    function fetchJson(url) {
        if (!window.fetch) {
            return Promise.reject(new Error('This browser does not support fetch().'));
        }

        var controller = ('AbortController' in window) ? new AbortController() : null;
        var timer = window.setTimeout(function () {
            if (controller) { controller.abort(); }
        }, REQUEST_TIMEOUT);

        var options = { headers: { 'Accept': 'application/json' } };
        if (controller) { options.signal = controller.signal; }

        return window.fetch(url, options)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('The movie service answered with status ' + response.status + '.');
                }
                return response.json();
            })
            .catch(function (error) {
                if (error && error.name === 'AbortError') {
                    throw new Error('The request took too long. Please try again.');
                }
                if (error instanceof TypeError) {
                    throw new Error('No connection to the movie service. Check your internet connection.');
                }
                throw error;
            })
            .then(function (data) {
                window.clearTimeout(timer);
                return data;
            }, function (error) {
                window.clearTimeout(timer);
                throw error;
            });
    }

    function stripHtml(html) {
        if (!html) { return ''; }
        var temp = document.createElement('div');
        temp.innerHTML = html;
        return (temp.textContent || temp.innerText || '').trim();
    }

    function firstYear(premiered) {
        if (!premiered) { return '—'; }
        return String(premiered).slice(0, 4);
    }

    function normalize(show) {
        return {
            id: show.id,
            name: show.name,
            year: firstYear(show.premiered),
            rating: (show.rating && show.rating.average) ? Number(show.rating.average.toFixed(1)) : null,
            genres: show.genres || [],
            status: show.status || 'Unknown',
            runtime: show.runtime || null,
            summary: stripHtml(show.summary) || 'No description available for this title.',
            image: show.image ? (show.image.medium || show.image.original) : null,
            url: show.url || ''
        };
    }

    var api = {
        /**
         * Search titles by name: GET /search/shows?q=<query>
         */
        searchShows: function (query) {
            var clean = (query || '').trim();
            if (!clean) {
                return Promise.reject(new Error('Please type a movie or series name first.'));
            }
            return fetchJson(API_BASE + '/search/shows?q=' + encodeURIComponent(clean))
                .then(function (results) {
                    if (!Array.isArray(results)) {
                        throw new Error('Unexpected answer from the movie service.');
                    }
                    return results.slice(0, 12).map(function (item) {
                        return normalize(item.show);
                    });
                });
        },

        /* Random title: GET /shows?page= */
        randomShow: function () {
            var page = 1 + Math.floor(Math.random() * 40);
            return fetchJson(API_BASE + '/shows?page=' + page)
                .then(function (list) {
                    if (!Array.isArray(list) || !list.length) {
                        throw new Error('The movie service returned an empty list.');
                    }
                    var show = list[Math.floor(Math.random() * list.length)];
                    return normalize(show);
                });
        },

        /* Schedule: GET /schedule?country=&date= */
        schedule: function (date, country) {
            var day = date || new Date().toISOString().slice(0, 10);
            return fetchJson(API_BASE + '/schedule?country=' + encodeURIComponent(country || 'US') + '&date=' + day)
                .then(function (items) {
                    if (!Array.isArray(items)) {
                        throw new Error('Unexpected answer from the movie service.');
                    }
                    return items.slice(0, 12).map(function (item) {
                        return {
                            time: item.airstamp || '',
                            show: normalize(item.show),
                            episode: item.episode ? {
                                name: item.episode.name,
                                season: item.episode.season,
                                number: item.episode.number
                            } : null
                        };
                    });
                });
        }
    };

    window.CinemaHub.api = api;
})(window);
