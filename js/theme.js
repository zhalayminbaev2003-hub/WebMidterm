/* CinemaHub - theme manager (loaded in <head>) */
(function (window, document) {
    'use strict';

    var STORAGE_KEY = 'cinemahubTheme';
    var root = document.documentElement;

    function readStoredTheme() {
        try {
            return window.localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            return null; // private mode / disabled storage
        }
    }

    function storeTheme(theme) {
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch (error) {
            /* storage is not available - the theme still works for this page view */
        }
    }

    function preferredTheme() {
        var stored = readStoredTheme();
        if (stored === 'light' || stored === 'dark') {
            return stored;
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }

    var currentTheme = preferredTheme();

    function applyTheme(theme) {
        currentTheme = theme;
        root.setAttribute('data-theme', theme);
        root.style.colorScheme = theme;
    }

    applyTheme(currentTheme);

    window.CinemaHub = window.CinemaHub || {};

    window.CinemaHub.theme = {
        get: function () {
            return currentTheme;
        },
        toggle: function () {
            var next = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            storeTheme(next);
            return next;
        },
        set: function (theme) {
            applyTheme(theme);
            storeTheme(theme);
            return currentTheme;
        }
    };
})(window, document);
