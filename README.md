# Utku Egemen Umut

A simple personal homepage using the wording from the GitHub profile README, with a profile photo, news, a blog section, experience, open-source contributions, teaching, and tools. Plain HTML and CSS, with no browser JavaScript or external font dependencies.

## Local development

Requires Node.js 18 or newer. No dependency installation is needed.

```sh
npm run dev
```

Open http://localhost:5173. Use `npm run dev -- --port 3000` to select another port. Restart the server after editing the profile or page renderer.

## Content and styling

- `src/profile.js` contains the README wording, news, blog entries, experience, contributions, projects, teaching, tools, and contact links.
- `src/page.js` renders the profile into semantic HTML during development and builds.
- `index.html` is the document template.
- `src/style.css` contains the responsive layout, typography, and print styles.
- `public/resume.pdf` is the downloadable résumé.
- `public/profile.jpg` is a local copy of the GitHub profile picture.
- `public/profile-readme.md` and `public/github-metrics.svg` preserve the original GitHub README and its activity image independently of the profile repository.

Open-source contributions appear directly on the page. Other projects and the preserved GitHub activity image are available in native HTML disclosures that work without JavaScript. The blog starts empty; add posts to `profile.posts` as `{ name, url, summary }`. News entries use `{ date, text }`. Update the footer date in `src/page.js` when changing the content.

## Validation and deployment

```sh
npm run check
npm test
npm run build
```

The build renders a complete `dist/index.html` and copies the stylesheet, favicon, résumé, portrait, and preserved README assets. All homepage content and navigation work with JavaScript disabled. Deploy `dist/` at the domain root. GitHub Pages must use **GitHub Actions** as its deployment source.

The GitHub Actions workflow in `.github/workflows/pages.yml` checks, tests, builds, and publishes the site to GitHub Pages on pushes to `main`.

Files from the former desktop interface remain in the repository for reference and are excluded from the build.
