# Utku’s personal desktop

A responsive personal website styled after Ubuntu Yaru, using official Yaru icons, Ubuntu typography, and Yaru's orange/neutral GTK palette. Built with plain HTML, CSS, and JavaScript; no dependencies or framework required.

## Run locally

Requires Node.js 18 or newer.

```sh
npm run dev
```

Open http://localhost:5173. To select another port: `npm run dev -- --port 3000`.

## Personalize

Edit `src/profile.js` to update your bio, links, projects, and résumé. Your contact details are public on this website.

- Add your résumé PDF to `public/resume.pdf` and set `resume: '/public/resume.pdf'`.
- Add projects as `{ name: 'Project name', description: 'What it does', url: 'https://…' }` in `projects`.
- Add strings to `skills` to show them on the About page.
- The home greeting is in `homeContent()` in `src/app.js`.
- Yaru-specific web styling lives in `src/yaru.css`.
- Official icon assets are pinned to a specific upstream revision and stored locally under `public/yaru/`. See [icon attribution](public/yaru/ATTRIBUTION.md), the included CC BY-SA 4.0 license, and contributor list.

Projects, skills, and résumé start empty; the site doesn’t invent any experience.

## Desktop features

- A skippable boot animation welcomes visitors once per tab session. Replay it from the system menu in the top-right corner. Reduced-motion preferences skip the intro automatically.
- Drag windows by their title bars; minimize, maximize, close, and reopen them from the dock.
- Double-click a title bar to toggle maximization. Resize windows from the bottom-right corner.
- Browse portfolio folders with Files.
- Open the terminal with **Ctrl + `** and type `help`. It’s a simulated portfolio terminal, not a system shell.
- Search applications through Activities. Escape dismisses the launcher and popovers.
- Switch between light and dark windows or three wallpaper palettes in Settings. Preferences stay in local storage when available.
- The mobile layout uses full-sized app windows above a bottom dock.
- The top panel reflects browser-reported network connectivity and battery level/charging changes where supported. Battery access requires HTTPS or localhost and is unavailable in some browsers. Unknown values are labeled unavailable.
- Websites cannot read the operating system's master volume, mute setting, or Wi-Fi signal strength. The sound indicator is marked unknown, and the menu directs visitors to their laptop's volume keys. Network speed estimates are never treated as Wi-Fi strength or connection type; an online report does not guarantee internet access.
- Three games have their own desktop shortcuts and appear in Activities: **Dino Run**, **Snake**, and **Memory**. Running games also appear in the dock.
- Dino Run: Space, Up, tap the game, or the Jump button. Snake: arrows, WASD, swipe, or direction buttons. Memory: click or keyboard-select matching pairs.
- Games pause when minimized, when another app takes focus, when the tab is hidden, or when the browser loses focus. Use the Resume button to continue. Closing a game stops its animation and removes its listeners.
- Dino Run and Snake save personal bests locally. Game illustrations and icons are original; Dino Run is inspired by the offline runner, with no Google assets included.

## Build

```sh
npm run check
npm test
npm run build
```

Deploy the generated `dist/` folder to a static host at the domain root. The included server is for local development. Fonts load from Google Fonts, with system font fallbacks if unavailable. This site is inspired by Ubuntu’s desktop and is not affiliated with Canonical.
