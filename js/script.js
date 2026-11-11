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
    }
});
