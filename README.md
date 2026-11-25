# Utku Egemen Umut

A simple personal homepage with an introduction, experience, open-source contributions, projects, teaching, and education. Plain HTML and CSS, with no browser JavaScript or external font dependencies.

## Local development

Requires Node.js 18 or newer. No dependency installation is needed.

```sh
npm run dev
```

Open http://localhost:5173. Use `npm run dev -- --port 3000` to select another port. Restart the server after editing the profile or page renderer.

## Content and styling

- `src/profile.js` contains the biography, experience, education, projects, and contact links. Experience uses short `summary` descriptions on the homepage; detailed `highlights` remain available for reference.
- `src/page.js` renders the profile into semantic HTML during development and builds.
- `index.html` is the document template.
- `src/style.css` contains the responsive layout, typography, and print styles.
- `public/resume.pdf` is the downloadable résumé.

The first three projects appear directly on the page. The remaining projects are available in a native HTML disclosure that works without JavaScript. Update the footer date in `src/page.js` when changing the content.

## Validation and deployment

```sh
npm run check
npm test
npm run build
```

The build renders a complete `dist/index.html` and copies only the stylesheet, favicon, and résumé. All homepage content and navigation work with JavaScript disabled. Deploy `dist/` at the domain root.

The GitHub Actions workflow in `.github/workflows/pages.yml` checks, tests, builds, and publishes the site to GitHub Pages on pushes to `main`.

Files from the former desktop interface remain in the repository for reference and are excluded from the build.
