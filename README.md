# CinemaHub - Web Development Endterm Project

CinemaHub is a movie information website created for our Web Development course. The project started
during the midterm and was extended for the endterm with the features required by the
**Final Project Requirements**: a light/dark theme, a localStorage sign-in, a jQuery FAQ accordion and
a live public API integration.

**Live website:** https://zhalayminbaev2003-hub.github.io/WebMidterm/
**Repository:** https://github.com/zhalayminbaev2003-hub/WebMidterm

---

## Group Members

- Turganbay Islambek
- Almanzor Kamzeyev
- Nurkhan Karashev

---

## Project Topic

A cinema portal where a visitor can browse a hand-picked movie catalog, watch official trailers, check
and edit a personal ranking of films, read answers to the most common questions, get live information
about titles and TV schedules from an open API, and contact the team.

---

## Website Pages (6)

| # | Page | File | Content |
|---|------|------|---------|
| 1 | Home | `index.html` | Hero banner, popular films, account panel, live TV schedule, poster gallery with lightbox |
| 2 | Movies | `movies.html` | Movie catalog, live search, genre filters, **TVMaze API search** |
| 3 | Trailers | `trailers.html` | Official trailers embedded from YouTube (`iframe`) |
| 4 | Reviews | `reviews.html` | Ranking table with Add / Edit / Delete (CRUD) stored in localStorage |
| 5 | FAQ | `faq.html` | 9 questions with a jQuery `slideToggle()` accordion |
| 6 | Contact | `contact.html` | Feedback form, validation, password strength bar, session panel |

Every page has the same navigation bar (with the active page highlighted), the same footer and the same
scripts, and all links lead to existing pages.

---

## Implemented Features

### HTML & CSS
- Semantic HTML5 structure (`header`, `nav`, `main`, `section`, `article`, `footer`, `label`, `table`).
- All styling lives in one external file: `css/style.css`.
- Flexbox for the header / account panel, CSS Grid for the movie cards and the schedule list.
- Design tokens (CSS variables) for colours, spacing, radius and shadows.
- Responsive layout with media queries for 992px, 768px, 600px and 480px (desktop, tablet, mobile).
- All images, icons, jQuery and Bootstrap are stored inside the project folder (`images/`, `js/`, `vendor/`).

### JavaScript
- **Light / dark theme toggle** (`js/theme.js` + `js/script.js`).
  The chosen theme is stored in `localStorage` (`cinemahubTheme`), applied on every page before the
  first paint and re-applied after a refresh.
- **Sign-in / sign-out with localStorage** (`js/script.js`).
  A modal sign-in form validates the display name, e-mail (RegExp) and password (min. 6 characters).
  Only non-sensitive data (name, e-mail, login time) is stored under `cinemahubUser`; the user stays
  signed in after a refresh, the navigation bar shows the user chip instead of the *Sign In* button,
  the Reviews page unlocks the rating form for signed-in users, and the *Sign Out* button removes the
  stored session.

### jQuery
- **FAQ accordion** on `faq.html`: 9 project-related questions, the answer is opened and closed with
  jQuery `.slideToggle()`, the animation is smooth (350 ms) and a `+` / `−` indicator shows the state.
  *Expand all* / *Collapse all* buttons are included as well.
- Existing jQuery features from the midterm were kept: form validation, gallery lightbox with
  `fadeIn/fadeOut`, live movie search, category filters and the CRUD table.

### API integration
- **TVMaze API** (https://www.tvmaze.com/api) - free, no API key, CORS enabled, therefore it also works
  on the published GitHub Pages site.
  - `GET /search/shows?q=...` - live title search on the Movies page.
  - `GET /shows/random` - "Random title" button.
  - `GET /schedule?country=US&date=YYYY-MM-DD` - "On TV today" widget on the Home page.
- All requests are made with `fetch()`, the JSON answer is processed and rendered with jQuery.
- User interaction: search, sorting (A-Z / rating / year), random pick and a date picker.
- Error handling: `response.ok` check, 12-second `AbortController` timeout, `try/catch` with friendly
  messages for network errors, timeouts and empty results.
- Deep link: opening `movies.html?q=matrix` runs the search immediately, which is handy for the defense.

---

## Report

The full endterm report (objectives, structure, features, development process, contribution of every
member, screenshots and links) is in [`REPORT.md`](REPORT.md); the screenshots are in `report/images/`.

---

## Technologies Used

HTML5, CSS3 (Flexbox, Grid, variables), Bootstrap 5.3 (local copy), JavaScript (ES5-compatible syntax
inside jQuery), jQuery 3.7.1 (local copy), TVMaze public API, Git and GitHub Pages.

---

## Group Contributions

### Turganbay Islambek
- Midterm: project setup, global HTML structure, Home page, movie catalog layout, hover overlay.
- Endterm: light/dark theme toggle with `localStorage` persistence (`js/theme.js`), the API layer
  (`js/api.js`), the "Find a title online" block on the Movies page and the "On TV today" widget on the
  Home page, final integration of the shared navigation bar and footer.

### Almanzor Kamzeyev
- Midterm: Trailers page, global styling (`css/style.css`), Flexbox/Grid layout, responsive design.
- Endterm: the FAQ page with the jQuery `slideToggle()` accordion, the design-token refactor of the
  stylesheet into light/dark themes, and the styling of all new components (theme button, user chip,
  sign-in modal, API panels, schedule list).

### Nurkhan Karashev
- Midterm: Reviews page, Contact page, form validation, password strength indicator, Git workflow.
- Endterm: the localStorage sign-in / sign-out logic with input validation, the signed-in / guest
  interface (navigation user chip, account panel on the Home page, locked rating form on the Reviews
  page), and the update of the README and the project report.

---

## Git Workflow

All work is done in one shared GitHub repository. Every feature is committed separately with a clear
message, so the commit history shows who implemented which part of the project.

```
git log --oneline
```

---

## How to Run Locally

```bash
# open the folder in a simple web server
python -m http.server 8000
# then visit http://localhost:8000
```

The site also works by double-clicking `index.html` (file://). The API block needs an internet
connection.

---

## Folder Structure

```
WebMidterm/
├── index.html            Home page
├── movies.html           Catalog + TVMaze API search
├── trailers.html         YouTube trailers
├── reviews.html          CRUD ranking table
├── faq.html              jQuery FAQ accordion
├── contact.html          Feedback form
├── README.md             This file
├── REPORT.md             Endterm project report (with screenshots in report/images/)
├── css/
│   └── style.css         All styles + light/dark themes
├── js/
│   ├── jquery.min.js     jQuery 3.7.1 (local copy)
│   ├── theme.js          Theme manager (applies the saved theme)
│   ├── api.js            TVMaze API layer (fetch + error handling)
│   └── script.js         Forms, gallery, search, CRUD, auth, FAQ, API rendering
├── images/               Posters and the page background
├── report/images/        Screenshots used in the report
└── vendor/
    └── bootstrap/        Bootstrap 5.3 CSS + JS bundle (local copy)
```
