$(function () {
    const form = $('#registrationForm');
    if (form.length) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        function passwordScore(value) {
            let score = 0;
            if (value.length >= 8) score++;
            if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
            if (/\d/.test(value) && /[^a-zA-Z0-9]/.test(value)) score++;
            return score;
        }
        function check(id, errorId) {
            const value = $('#' + id).val().trim();
            let error = '';
            if (!value) error = 'This field is required';
            else if (id === 'userEmail' && !emailPattern.test(value)) error = 'Invalid email';
            else if (id === 'userPassword' && passwordScore(value) < 3) error = 'Use a stronger password';
            else if (id === 'confirmPassword' && value !== $('#userPassword').val()) error = 'Passwords do not match';
            $('#' + errorId).text(error);
            $('#' + id).toggleClass('is-invalid', !!error).toggleClass('is-valid', !error);
            return !error;
        }
        const fields = {
            userName: 'nameError',
            userEmail: 'emailError',
            userPassword: 'passwordError',
            confirmPassword: 'confirmError',
            userMessage: 'messageError'
        };
        function strength() {
            const value = $('#userPassword').val();
            const score = value ? passwordScore(value) : 0;
            const labels = ['', 'Weak', 'Medium', 'Strong'];
            const widths = ['0%', '33%', '66%', '100%'];
            const colors = ['', 'bg-danger', 'bg-warning', 'bg-success'];
            $('#strengthBar').removeClass('bg-danger bg-warning bg-success')
                .addClass(colors[score]).css('width', widths[score]);
            $('#strengthText').text(labels[score]);
        }
        Object.keys(fields).forEach(function (id) {
            $('#' + id).on('input', function () {
                check(id, fields[id]);
                if (id === 'userPassword') {
                    strength();
                    if ($('#confirmPassword').val()) check('confirmPassword', 'confirmError');
                }
            });
        });
        form.on('submit', function (event) {
            event.preventDefault();
            let valid = true;
            Object.keys(fields).forEach(function (id) {
                if (!check(id, fields[id])) valid = false;
            });
            $('#formResult').attr('class', valid ? 'alert alert-success' : 'alert alert-danger')
                .text(valid ? 'Form checked successfully!' : 'Please correct the fields.');
        });
    }
});

$(function () {
    const gallery = $('#posterGallery .gallery-item');
    if (gallery.length) {
        let current = 0;
        const lightbox = $('#galleryLightbox');
        function updateImage() {
            const item = gallery.eq(current);
            $('#largeImage').attr('src', item.find('img').attr('src'))
                .attr('alt', item.find('img').attr('alt'));
        }
        gallery.on('click', function () {
            current = gallery.index(this);
            updateImage();
            lightbox.css('display', 'flex').hide().fadeIn(250);
        });
        $('#nextImage').on('click', function () {
            current = (current + 1) % gallery.length;
            $('#largeImage').fadeOut(120, function () {
                updateImage();
                $(this).fadeIn(180);
            });
        });
        $('#prevImage').on('click', function () {
            current = (current - 1 + gallery.length) % gallery.length;
            $('#largeImage').fadeOut(120, function () {
                updateImage();
                $(this).fadeIn(180);
            });
        });
        $('#closeGallery').on('click', function () {
            lightbox.fadeOut(250);
        });
        lightbox.on('click', function (event) {
            if (event.target === this) lightbox.fadeOut(250);
        });
        $(document).on('keydown', function (event) {
            if (event.key === 'Escape') { lightbox.fadeOut(250); }
        });
    }
});

$(function () {
    if ($('#movieSearch').length) {
        let category = 'all';
        function filterMovies() {
            const search = $('#movieSearch').val().trim().toLowerCase();
            let count = 0;
            $('.movie-grid .movie-card').each(function () {
                const text = $(this).find('.movie-info').text().toLowerCase();
                const genre = $(this).data('category');
                const match = text.includes(search) &&
                    (category === 'all' || genre === category);
                $(this).toggle(match);
                if (match) count++;
            });
            $('#searchResult').text('Movies found: ' + count);
        }
        $('#movieSearch').on('input', filterMovies);
        $('.filter-btn').on('click', function () {
            category = $(this).data('filter');
            $('.filter-btn').removeClass('btn-danger').addClass('btn-outline-light');
            $(this).removeClass('btn-outline-light').addClass('btn-danger');
            filterMovies();
        });
        filterMovies();
    }
});

$(function () {
    if ($('#movieTableBody').length) {
        const key = 'cinemahubMovies';
        let movies = [];
        $('#movieTableBody tr').each(function (index) {
            const t = $(this).find('td');
            movies.push({id: index + 1, title: t.eq(0).text().trim(),
                director: t.eq(1).text().trim(), year: Number(t.eq(2).text()),
                rating: Number(t.eq(3).text())});
        });
        try {
            const saved = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(saved)) movies = saved;
        } catch (error) {}
        let editingId = null;
        function save() {
            try { localStorage.setItem(key, JSON.stringify(movies)); }
            catch (error) { $('#movieAlert').text('Storage is unavailable'); }
        }
        function render() {
            const body = $('#movieTableBody').empty();
            movies.forEach(function (movie, index) {
                const row = $('<tr>');
                $('<th>').text(index + 1).appendTo(row);
                $('<td>').text(movie.title).appendTo(row);
                $('<td>').text(movie.director).appendTo(row);
                $('<td>').text(movie.year).appendTo(row);
                $('<td>').text(movie.rating).appendTo(row);
                const buttons = $('<td>');
                $('<button>').addClass('btn btn-warning btn-sm me-2')
                    .text('Edit').attr('data-edit', movie.id).appendTo(buttons);
                $('<button>').addClass('btn btn-danger btn-sm')
                    .text('Delete').attr('data-delete', movie.id).appendTo(buttons);
                row.append(buttons).appendTo(body);
            });
        }
        $('#movieForm').on('submit', function (event) {
            event.preventDefault();
            if (!this.checkValidity()) { this.reportValidity(); return; }
            const title = $('#movieTitle').val().trim();
            const director = $('#movieDirector').val().trim();
            const year = Number($('#movieYear').val());
            const rating = Number($('#movieRating').val());
            if (!title || !director || year < 1888 || year > 2100 ||
                rating < 0 || rating > 10) return;
            if (editingId === null) {
                const id = movies.reduce((max, m) => Math.max(max, m.id), 0) + 1;
                movies.push({id, title, director, year, rating});
            } else {
                const movie = movies.find(m => m.id === editingId);
                if (movie) Object.assign(movie, {title, director, year, rating});
                editingId = null;
            }
            save();
            render();
            this.reset();
            $('#saveMovie').text('Add');
        });
        $('#movieTableBody').on('click', '[data-edit]', function () {
            const id = Number($(this).attr('data-edit'));
            const movie = movies.find(m => m.id === id);
            if (!movie) return;
            editingId = id;
            $('#movieTitle').val(movie.title);
            $('#movieDirector').val(movie.director);
            $('#movieYear').val(movie.year);
            $('#movieRating').val(movie.rating);
            $('#saveMovie').text('Save');
        });
        $('#movieTableBody').on('click', '[data-delete]', function () {
            const id = Number($(this).attr('data-delete'));
            if (!confirm('Delete this movie?')) return;
            movies = movies.filter(m => m.id !== id);
            if (editingId === id) {
                editingId = null;
                $('#movieForm')[0].reset();
                $('#saveMovie').text('Add');
            }
            save();
            render();
        });
        render();
    }
});

$(function () {
    function paintToggle(theme) {
        const isDark = theme === 'dark';
        $('#themeIcon').text(isDark ? '🌙' : '☀️');
        $('#themeToggle')
            .attr('title', isDark ? 'Switch to the light theme' : 'Switch to the dark theme')
            .attr('aria-label', isDark ? 'Switch to the light theme' : 'Switch to the dark theme')
            .attr('aria-pressed', isDark ? 'false' : 'true');
    }

    if (window.CinemaHub && window.CinemaHub.theme) {
        paintToggle(window.CinemaHub.theme.get());
    }

    $('#themeToggle').on('click', function () {
        if (!window.CinemaHub || !window.CinemaHub.theme) { return; }
        paintToggle(window.CinemaHub.theme.toggle());
    });
});

$(function () {
    const AUTH_KEY = 'cinemahubUser';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function getUser() {
        try {
            const raw = localStorage.getItem(AUTH_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    function setUser(user) {
        try {
            localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        } catch (error) {
            $('#authMessage').text('Local storage is not available in this browser.');
        }
    }

    function clearUser() {
        try {
            localStorage.removeItem(AUTH_KEY);
        } catch (error) {}
    }

    function initials(name) {
        return (name || 'U').trim().charAt(0).toUpperCase();
    }

    function renderUser() {
        const user = getUser();
        const signedIn = !!user;

        $('#signInBtn').toggleClass('d-none', signedIn);
        $('#userChip').toggleClass('d-none', !signedIn);

        if (signedIn) {
            $('#userInitial').text(initials(user.name));
            $('#userNameLabel').text(user.name);
            $('#accountCard').removeClass('d-none');
            $('#guestCard').addClass('d-none');
            $('#accountAvatar').text(initials(user.name));
            $('#accountTitle').text('Welcome back, ' + user.name + '!');
            $('#accountText').text('Signed in as ' + user.email + '.');
        } else {
            $('#accountCard').addClass('d-none');
            $('#guestCard').removeClass('d-none');
        }

        $('#movieForm input, #movieForm select, #movieForm button').prop('disabled', !signedIn);
        $('#reviewLockHint').toggleClass('d-none', signedIn);
        $('#reviewSignedInHint').toggleClass('d-none', !signedIn);

        $('#authMessage')
            .removeClass('alert-success alert-danger')
            .addClass(signedIn ? 'alert-success' : 'alert-info')
            .text(signedIn
                ? 'Signed in as ' + user.email + '.'
                : 'You are browsing as a guest. Sign in to add your own ratings.');
    }

    function validateSignIn() {
        const email = $('#signInEmail').val().trim();
        const password = $('#signInPassword').val();
        const name = $('#signInName').val().trim();

        let emailError = '';
        let passwordError = '';

        if (!email) {
            emailError = 'E-mail is required';
        } else if (!emailPattern.test(email)) {
            emailError = 'Please enter a valid e-mail address';
        }

        if (!password) {
            passwordError = 'Password is required';
        } else if (password.length < 6) {
            passwordError = 'Password must be at least 6 characters long';
        }

        $('#signInEmailError').text(emailError);
        $('#signInPasswordError').text(passwordError);
        $('#signInEmail').toggleClass('is-invalid', !!emailError).toggleClass('is-valid', !emailError && !!email);
        $('#signInPassword').toggleClass('is-invalid', !!passwordError).toggleClass('is-valid', !passwordError && !!password);

        return !emailError && !passwordError;
    }

    $('#signInForm').on('submit', function (event) {
        event.preventDefault();
        if (!validateSignIn()) { return; }

        const email = $('#signInEmail').val().trim();
        const typedName = $('#signInName').val().trim();
        const name = typedName || email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, function (c) {
            return c.toUpperCase();
        });

        setUser({ name: name, email: email, signedInAt: new Date().toISOString() });

        this.reset();
        $('#signInEmail, #signInPassword').removeClass('is-valid is-invalid');
        renderUser();

        const modalElement = document.getElementById('signInModal');
        if (modalElement && window.bootstrap) {
            window.bootstrap.Modal.getOrCreateInstance(modalElement).hide();
        }
    });

    $('#signInForm input').on('input', validateSignIn);

    $(document).on('click', '#signOutBtn, #accountSignOut', function () {
        clearUser();
        renderUser();
        $('#authMessage')
            .removeClass('alert-success alert-danger')
            .addClass('alert-info')
            .text('You have been signed out. The saved session was removed from localStorage.');
    });

    renderUser();
});

$(function () {
    const $questions = $('.faq-question');

    if ($questions.length) {
        $questions.on('click', function () {
            const $button = $(this);
            const $answer = $button.next('.faq-answer');
            const $indicator = $button.find('.faq-toggle');
            const isOpen = $button.attr('aria-expanded') === 'true';

            $answer.slideToggle(350);
            $button.attr('aria-expanded', isOpen ? 'false' : 'true');
            $indicator.text(isOpen ? '+' : '−');
        });

        $('#expandAll').on('click', function () {
            $questions.each(function () {
                const $button = $(this);
                const $answer = $button.next('.faq-answer');
                if ($button.attr('aria-expanded') !== 'true') {
                    $answer.slideDown(350);
                    $button.attr('aria-expanded', 'true');
                    $button.find('.faq-toggle').text('−');
                }
            });
        });

        $('#collapseAll').on('click', function () {
            $questions.each(function () {
                const $button = $(this);
                const $answer = $button.next('.faq-answer');
                if ($button.attr('aria-expanded') === 'true') {
                    $answer.slideUp(350);
                    $button.attr('aria-expanded', 'false');
                    $button.find('.faq-toggle').text('+');
                }
            });
        });
    }
});

$(function () {
    const api = window.CinemaHub ? window.CinemaHub.api : null;
    if (!api) { return; }

    let currentResults = [];

    function setStatus(message, type) {
        $('#apiStatus')
            .removeClass('loading success error')
            .addClass(type || '')
            .text(message);
    }

    function showSkeletons(count) {
        const $box = $('#apiResults').empty();
        for (let i = 0; i < count; i++) {
            $('<div class="skeleton">').appendTo($box);
        }
    }

    function buildCard(show) {
        const $card = $('<div class="movie-card api-card">');

        if (show.image) {
            $('<img>').attr('src', show.image).attr('alt', show.name).attr('loading', 'lazy').appendTo($card);
        } else {
            $('<div class="skeleton" style="height:320px">').appendTo($card);
        }

        $('<span class="rating-badge">')
            .text(show.rating !== null ? show.rating.toFixed(1) : 'N/A')
            .appendTo($card);

        const $info = $('<div class="movie-info">');
        $('<h3>').text(show.name).appendTo($info);
        $('<p>').text((show.genres.join(', ') || 'Unclassified') + ' • ' + show.year).appendTo($info);
        $('<p class="api-summary">').text(show.summary).appendTo($info);

        const $tags = $('<div>');
        show.genres.slice(0, 3).forEach(function (genre) {
            $('<span class="tag-pill">').text(genre).appendTo($tags);
        });
        $tags.appendTo($info);

        if (show.url) {
            $('<a>').attr('href', show.url).attr('target', '_blank').attr('rel', 'noopener')
                .attr('class', 'api-link').text('Open on TVMaze →').appendTo($info);
        }

        $card.append($info);
        return $card;
    }

    function renderResults(list) {
        currentResults = list;
        const $box = $('#apiResults').empty();

        if (!list.length) {
            $('<p class="api-status">').text('Nothing found for this request. Try another title.').appendTo($box);
            return;
        }

        list.forEach(function (show) {
            $box.append(buildCard(show));
        });
    }

    function sortResults(mode) {
        if (mode === 'rating') {
            currentResults.sort(function (a, b) {
                return (b.rating || 0) - (a.rating || 0);
            });
        } else if (mode === 'year') {
            currentResults.sort(function (a, b) {
                return String(b.year).localeCompare(String(a.year));
            });
        } else {
            currentResults.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
        }
        renderResults(currentResults);
    }

    function runSearch(query) {
        setStatus('Loading titles from the TVMaze API…', 'loading');
        showSkeletons(3);

        api.searchShows(query)
            .then(function (results) {
                renderResults(results);
                if (results.length) {
                    setStatus('Found ' + results.length + ' title(s) for "' + query + '".', 'success');
                } else {
                    setStatus('No titles matched "' + query + '".', 'error');
                }
            })
            .catch(function (error) {
                $('#apiResults').empty();
                setStatus(error.message || 'The request failed. Please try again.', 'error');
            });
    }

    $('#apiSearchForm').on('submit', function (event) {
        event.preventDefault();
        const query = $('#apiQuery').val().trim();
        if (!query) {
            setStatus('Please type a movie or series name first.', 'error');
            return;
        }
        runSearch(query);
    });

    if ($('#apiQuery').length) {
        const deepLink = new URLSearchParams(window.location.search).get('q');
        if (deepLink) {
            $('#apiQuery').val(deepLink);
            runSearch(deepLink);
        }
    }

    $('#randomMovieBtn').on('click', function () {
        setStatus('Picking a random title…', 'loading');
        showSkeletons(1);

        api.randomShow()
            .then(function (show) {
                renderResults([show]);
                setStatus('Random pick: ' + show.name + ' (' + show.year + ').', 'success');
            })
            .catch(function (error) {
                $('#apiResults').empty();
                setStatus(error.message || 'The request failed. Please try again.', 'error');
            });
    });

    $('#apiSort').on('change', function () {
        if (!currentResults.length) {
            setStatus('Search for a title first, then you can sort the results.', 'error');
            return;
        }
        sortResults($(this).val());
    });

    function todayISO() {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
    }

    function loadSchedule(date) {
        const $list = $('#scheduleList');
        const $status = $('#scheduleStatus');

        $status.removeClass('success error').addClass('loading').text('Loading the TV schedule…');
        $list.empty();
        $('<li class="schedule-item">').text('Loading…').appendTo($list);

        api.schedule(date, 'US')
            .then(function (items) {
                $list.empty();
                if (!items.length) {
                    $('<li class="schedule-item">')
                        .text('No TV shows are scheduled for this date.')
                        .appendTo($list);
                    $status.removeClass('loading').addClass('success')
                        .text('The schedule for ' + date + ' is empty.');
                    return;
                }
                items.forEach(function (item) {
                    const $row = $('<li class="schedule-item">');
                    $('<span class="schedule-time">').text(item.time || 'TBA').appendTo($row);
                    const $info = $('<div>');
                    $('<strong>').text(item.show.name).appendTo($info);
                    if (item.episode && item.episode.name) {
                        $('<div class="text-muted-custom">')
                            .text('S' + item.episode.season + 'E' + item.episode.number + ' • ' + item.episode.name)
                            .appendTo($info);
                    }
                    $('<div class="text-muted-custom">')
                        .text((item.show.genres.join(', ') || 'TV') + ' • ' + item.show.year)
                        .appendTo($info);
                    $row.append($info);
                    $list.append($row);
                });
                $status.removeClass('loading').addClass('success')
                    .text(items.length + ' show(s) scheduled on ' + date + '.');
            })
            .catch(function (error) {
                $list.empty();
                $('<li class="schedule-item">')
                    .text(error.message || 'The schedule could not be loaded.')
                    .appendTo($list);
                $status.removeClass('loading').addClass('error')
                    .text('The TV schedule is unavailable right now. Please try again.');
            });
    }

    if ($('#scheduleList').length) {
        $('#scheduleDate').val(todayISO());
        $('#scheduleForm').on('submit', function (event) {
            event.preventDefault();
            loadSchedule($('#scheduleDate').val() || todayISO());
        });
        loadSchedule(todayISO());
    }
});

$(function () {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    $('.nav-menu a').each(function () {
        const href = ($(this).attr('href') || '').split('#')[0];
        if (href === path) {
            $(this).addClass('active').attr('aria-current', 'page');
        }
    });
});
