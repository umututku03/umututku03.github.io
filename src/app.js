import { profile } from './profile.js';
import { icon, appIcon } from './icons.js';
import { gameApps, mountGame } from './games.js';
import { initSystemStatus } from './system-status.js';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const escape = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeLink = value => {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? escape(url.href) : '#'; } catch { return '#'; }
};
const apps = {
  welcome: { name: 'Welcome', subtitle: 'A little introduction', icon: 'home' },
  files: { name: 'Files', subtitle: 'Have a look around', icon: 'folder' },
  terminal: { name: 'Terminal', subtitle: 'For the curious', icon: 'terminal' },
  contact: { name: 'Contact', subtitle: 'Say hello', icon: 'mail' },
  settings: { name: 'Settings', subtitle: 'Make yourself at home', icon: 'settings' },
  resume: { name: 'Résumé', subtitle: 'The longer story', icon: 'file' },
  ...gameApps,
};
const windows = new Map();
let layer = 10;
let active = '';
let toastTimer;
let wallpaper = 'ubuntu';
let theme = 'light';
const bootMarkup = $('#boot').innerHTML;
try { wallpaper = localStorage.getItem('desktop-wallpaper') || wallpaper; theme = localStorage.getItem('desktop-theme') || theme; } catch { /* Storage is optional. */ }
document.documentElement.dataset.theme = theme;
document.documentElement.dataset.wallpaper = wallpaper;

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3200);
}

function renderDock() {
  $('#dock').innerHTML = Object.entries(apps).filter(([id, app]) => id !== 'resume' && (!app.game || windows.has(id))).map(([id, app]) => `<button class="dock-item ${app.game ? 'game-dock-item' : ''} ${windows.has(id) ? 'running' : ''} ${active === id ? 'active' : ''}" data-app="${id}" aria-label="${app.name}" title="${app.name}">${appIcon(id)}<span class="dock-tooltip">${app.name}</span></button>`).join('') + `<div class="dock-divider"></div><a class="dock-item" href="${safeLink(profile.github)}" target="_blank" rel="noopener noreferrer" aria-label="GitHub (opens in new tab)" title="GitHub"><span class="app-icon app-icon-github">${icon('github')}</span><span class="dock-tooltip">GitHub ↗</span></a><button class="dock-item launcher" data-action="activities" aria-label="Show applications" title="Show applications">${icon('grid')}<span class="dock-tooltip">Show applications</span></button>`;
}

function focusWindow(id) {
  const win = windows.get(id);
  if (!win) return;
  win.el.hidden = false;
  win.el.style.zIndex = ++layer;
  active = id;
  for (const [key, other] of windows) {
    other.el.classList.toggle('focused', key === id);
    if (key !== id) other.game?.pause();
  }
  $('#active-app').innerHTML = `${icon(apps[id].icon)} <span>${apps[id].name}</span>`;
  renderDock();
}

function selectNextWindow() {
  const next = [...windows.entries()].filter(([, w]) => !w.el.hidden).sort((a, b) => Number(b[1].el.style.zIndex) - Number(a[1].el.style.zIndex))[0];
  if (next) focusWindow(next[0]);
  else { active = ''; $('#active-app').innerHTML = ''; renderDock(); }
}

function openApp(id, page) {
  if (!apps[id]) return;
  closePopovers();
  $('#activities').hidden = true;
  $('#activities-button').setAttribute('aria-expanded', 'false');
  if (windows.has(id)) {
    focusWindow(id);
    if (page && id === 'welcome') renderWelcome(page);
    if (page && id === 'files') renderFiles(page);
    if (id === 'terminal') $('.terminal-input', windows.get(id).el)?.focus();
    return;
  }
  const el = document.createElement('section');
  el.className = `window window-${id}`;
  el.dataset.window = id;
  el.setAttribute('aria-label', apps[id].name);
  el.tabIndex = -1;
  const width = id === 'welcome' ? 1000 : id === 'terminal' ? 760 : id === 'files' ? 820 : id === 'dino' ? 820 : 640;
  const height = id === 'welcome' ? 658 : id === 'terminal' ? 460 : id === 'files' ? 520 : apps[id].game ? 680 : 570;
  el.style.width = `${Math.min(width, window.innerWidth - 124)}px`;
  el.style.height = `${Math.min(height, window.innerHeight - 115)}px`;
  el.style.left = `${Math.max(94, (window.innerWidth - Math.min(width, window.innerWidth - 124)) / 2 + 25 + windows.size * 12)}px`;
  el.style.top = `${Math.max(55, (window.innerHeight - Math.min(height, window.innerHeight - 115)) / 2 + 10 + windows.size * 8)}px`;
  el.innerHTML = `<header class="window-titlebar"><div class="window-title-icon">${icon(apps[id].icon)}</div><span class="window-title">${apps[id].name}${id === 'welcome' ? ' — Utku Egemen Umut' : ''}</span><div class="window-controls"><button data-control="minimize" aria-label="Minimize ${apps[id].name}" title="Minimize">${icon('minimize')}</button><button data-control="maximize" aria-label="Maximize ${apps[id].name}" title="Maximize">${icon('maximize')}</button><button class="close-control" data-control="close" aria-label="Close ${apps[id].name}" title="Close">${icon('close')}</button></div></header><div class="window-body"></div>`;
  $('#windows').append(el);
  windows.set(id, { el, page: page || 'home' });
  el.addEventListener('pointerdown', () => { if (active !== id) focusWindow(id); });
  setupDrag(el);
  focusWindow(id);
  if (id === 'welcome') renderWelcome(page || 'home');
  if (id === 'files') renderFiles(page || 'Home');
  if (id === 'terminal') renderTerminal();
  if (id === 'contact') $('.window-body', el).innerHTML = contactContent();
  if (id === 'settings') renderSettings();
  if (id === 'resume') $('.window-body', el).innerHTML = resumeContent();
  if (apps[id].game) windows.get(id).game = mountGame(id, $('.window-body', el));
  el.focus({ preventScroll: true });
  if (apps[id].game) $('[data-game="play"]', el).focus({ preventScroll: true });
  if (id === 'terminal') $('.terminal-input', el).focus();
}

function setupDrag(el) {
  const titlebar = $('.window-titlebar', el);
  titlebar.addEventListener('dblclick', e => { if (!e.target.closest('button')) toggleMaximize(el); });
  titlebar.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || el.classList.contains('maximized') || window.innerWidth <= 700) return;
    const start = el.getBoundingClientRect();
    const dx = e.clientX - start.left, dy = e.clientY - start.top;
    titlebar.setPointerCapture(e.pointerId);
    el.classList.add('dragging');
    const move = event => {
      el.style.left = `${Math.max(76, Math.min(window.innerWidth - el.offsetWidth, event.clientX - dx))}px`;
      el.style.top = `${Math.max(34, Math.min(window.innerHeight - 48, event.clientY - dy))}px`;
    };
    const stop = () => { titlebar.removeEventListener('pointermove', move); el.classList.remove('dragging'); };
    titlebar.addEventListener('pointermove', move);
    titlebar.addEventListener('pointerup', stop, { once: true });
    titlebar.addEventListener('pointercancel', stop, { once: true });
  });
}

function toggleMaximize(el) {
  const maximized = el.classList.toggle('maximized');
  const btn = $('[data-control="maximize"]', el);
  btn.title = maximized ? 'Restore' : 'Maximize';
  btn.setAttribute('aria-label', `${btn.title} ${apps[el.dataset.window].name}`);
}

const navItems = [['home', 'home', 'Welcome'], ['about', 'user', 'About me'], ['projects', 'folder', 'Projects'], ['resume', 'file', 'Résumé'], ['contact', 'mail', 'Get in touch']];
function renderWelcome(page = 'home') {
  const win = windows.get('welcome');
  win.page = page;
  $('.window-body', win.el).innerHTML = `<aside class="sidebar"><div class="sidebar-profile"><div class="avatar">u<span></span></div><div><strong>utku</strong><span>Home folder</span></div></div><div class="sidebar-label">Personal</div><nav aria-label="Portfolio">${navItems.map(([key, symbol, title]) => `<button class="sidebar-link ${page === key ? 'selected' : ''}" data-page="${key}" ${page === key ? 'aria-current="page"' : ''}>${icon(symbol)}<span>${title}</span>${page === key ? '<i></i>' : ''}</button>`).join('')}</nav><div class="sidebar-bottom"><span class="sidebar-label">Bookmarks</span><a href="${safeLink(profile.github)}" target="_blank" rel="noopener noreferrer">${icon('github')} GitHub ${icon('external')}</a><a href="${safeLink(profile.linkedin)}" target="_blank" rel="noopener noreferrer">${icon('linkedin')} LinkedIn ${icon('external')}</a><div class="sidebar-version"><span class="status-dot"></span> personal OS <span>v1.0</span></div></div></aside><div class="welcome-main">${page === 'home' ? homeContent() : page === 'about' ? aboutContent() : page === 'projects' ? projectsContent() : page === 'contact' ? contactContent() : resumeContent()}</div>`;
}

function homeContent() {
  return `<div class="home-content yaru-welcome"><div class="welcome-intro">${appIcon('welcome')}<div><div class="hello-label">Hey there, I'm</div><h1>${escape(profile.name)}</h1><p class="welcome-role">${escape(profile.role)}</p></div></div><p class="welcome-description">Welcome to my little corner of the internet.<br>Open a folder, try the terminal, or just say hello.</p><button class="primary-button welcome-about" data-page="about">A little about me ${icon('arrow')}</button><h3 class="welcome-section-title">Explore this desktop</h3><div class="home-actions"><button class="home-action" data-page="projects">${appIcon('files')}<span><strong>Projects</strong><small>A home for the things I build</small></span>${icon('arrow')}</button><button class="home-action" data-app="terminal">${appIcon('terminal')}<span><strong>Terminal</strong><small>Type “help” and see where it takes you</small></span>${icon('arrow')}</button><button class="home-action" data-page="contact">${appIcon('contact')}<span><strong>Get in touch</strong><small>Email, LinkedIn, GitHub — take your pick</small></span>${icon('arrow')}</button></div><div class="home-footer"><span>${icon('home')} Make yourself at home.</span><a href="https://github.com/ubuntu/yaru" target="_blank" rel="noopener noreferrer">Yaru by the Ubuntu community ${icon('external')}</a></div></div>`;
}

function aboutContent() {
  return `<article class="page-content"><div class="eyebrow">THE HUMAN BEHIND THE DESKTOP</div><div class="about-heading"><div class="avatar large">u<span></span></div><div><h2>${escape(profile.name)}</h2><p class="orange-text">${escape(profile.role)}</p></div></div><div class="about-note"><span class="note-label">about.txt</span><p>${escape(profile.bio)}</p></div>${profile.skills.length ? `<h3>Things I work with</h3><div class="skill-tags">${profile.skills.map(s => `<span>${escape(s)}</span>`).join('')}</div>` : ''}<p class="muted">You’ve found my Home folder on the web. Feel free to poke around, open a window, or drop me a line.</p><button class="primary-button" data-page="contact">Let's talk ${icon('arrow')}</button><div class="page-footnote">${icon('heart')} Thanks for stopping by.</div></article>`;
}

function projectsContent() {
  return `<article class="page-content"><div class="eyebrow">A FEW THINGS I'VE MADE</div><h2>Projects</h2>${profile.projects.length ? `<div class="project-list">${profile.projects.map(p => `<a href="${safeLink(p.url)}" target="_blank" rel="noopener noreferrer" class="project-card">${appIcon('files')}<div><h3>${escape(p.name)}</h3><p>${escape(p.description)}</p></div>${icon('external')}</a>`).join('')}</div>` : `<div class="empty-state">${appIcon('files')}<h3>A little quiet in here.</h3><p>Projects will find their home here soon.<br>In the meantime, you can find me on GitHub.</p><a class="secondary-button" href="${safeLink(profile.github)}" target="_blank" rel="noopener noreferrer">${icon('github')} Head to GitHub ${icon('external')}</a></div>`}</article>`;
}

function contactContent() {
  const links = [ ['mail', 'Email', profile.email, `mailto:${profile.email}`], ['phone', 'Phone', profile.phone, `tel:${profile.phone.replace(/[^+\d]/g, '')}`], ['linkedin', 'LinkedIn', 'utkuegemenumut', profile.linkedin], ['github', 'GitHub', 'umututku03', profile.github] ];
  return `<article class="page-content contact-content"><div class="eyebrow">GOOD CONVERSATIONS START SOMEWHERE</div><h2>Let's say hello<span class="orange-text">.</span></h2><p class="muted">Got an idea, a question, or just a good story?<br>My inbox is open.</p><div class="contact-links">${links.map(([symbol, label, value, href]) => `<div class="contact-row"><span class="contact-symbol">${icon(symbol)}</span><a href="${escape(href)}" ${symbol === 'github' || symbol === 'linkedin' ? 'target="_blank" rel="noopener noreferrer"' : ''}><span>${label}</span><strong>${escape(value)}</strong></a>${symbol === 'mail' ? `<button class="icon-button" data-action="copy-email" aria-label="Copy email address" title="Copy email">${icon('copy')}</button>` : icon('external')}</div>`).join('')}</div><div class="page-footnote">${icon('mail')} A small message can lead to something good.</div></article>`;
}

function resumeContent() {
  return `<article class="page-content"><div class="eyebrow">THE LONGER STORY</div><h2>My résumé</h2><div class="empty-state">${appIcon('resume')}<h3>${profile.resume ? 'A little more about me.' : 'Coming right up.'}</h3><p>${profile.resume ? 'The experience, the details, and everything in between.' : 'My résumé isn’t on the desktop just yet.<br>Drop me a line if you’d like to chat.'}</p>${profile.resume ? `<a class="primary-button" href="${escape(profile.resume)}" target="_blank" rel="noopener noreferrer">Open résumé ${icon('external')}</a>` : `<a class="secondary-button" href="mailto:${escape(profile.email)}">${icon('mail')} Get in touch</a>`}</div></article>`;
}

function renderFiles(folder = 'Home') {
  const win = windows.get('files');
  win.page = folder;
  const items = folder === 'Home' ? [['folder', 'About me', 'about'], ['folder', 'Projects', 'projects'], ['folder', 'Contact', 'contact'], ['file', 'README.txt', 'readme'], ['file', 'résumé.pdf', 'resume']] : folder === 'Projects' ? profile.projects.map((p, i) => ['folder', p.name, `project-${i}`]) : [['file', folder === 'About me' ? 'about.txt' : 'contact.txt', folder === 'About me' ? 'about' : 'contact']];
  $('.window-body', win.el).innerHTML = `<div class="files-layout"><aside class="files-sidebar"><div class="sidebar-label">PLACES</div>${['Home', 'About me', 'Projects', 'Contact'].map((name, i) => `<button class="sidebar-link ${folder === name ? 'selected' : ''}" data-folder="${name}">${icon(['home', 'user', 'folder', 'mail'][i])}${name}</button>`).join('')}</aside><div class="files-main"><div class="files-toolbar"><button class="icon-button" data-folder="Home" aria-label="Go to home folder" ${folder === 'Home' ? 'disabled' : ''}>${icon('back')}</button><div class="breadcrumbs">${icon('home')} <button data-folder="Home">Home</button>${folder !== 'Home' ? `${icon('chevron')} <span>${escape(folder)}</span>` : ''}</div><span class="files-view-icon">${icon('grid')}</span></div><div class="file-grid">${items.map(([type, name, action]) => `<button class="file-item" data-file="${action}">${appIcon(type === 'folder' ? 'files' : action === 'resume' ? 'resume' : 'text')}<span>${escape(name)}</span>${action === 'resume' && !profile.resume ? '<small>coming soon</small>' : ''}</button>`).join('')}${!items.length ? '<div class="folder-empty">This folder is waiting for its first project.</div>' : ''}</div><div class="files-status">${items.length} items <span>Home / ${escape(profile.username)}</span></div></div></div>`;
}

function renderSettings() {
  const el = windows.get('settings').el;
  $('.window-body', el).innerHTML = `<article class="page-content settings-content"><div class="eyebrow">YOUR DESKTOP, YOUR WAY</div><h2>Make yourself at home.</h2><h3>Appearance</h3><div class="theme-options"><button class="theme-option ${theme === 'light' ? 'chosen' : ''}" data-theme-choice="light"><span class="theme-preview light-preview"><i></i><b></b></span>${icon('sun')} Light ${theme === 'light' ? icon('check') : ''}</button><button class="theme-option ${theme === 'dark' ? 'chosen' : ''}" data-theme-choice="dark"><span class="theme-preview dark-preview"><i></i><b></b></span>${icon('moon')} Dark ${theme === 'dark' ? icon('check') : ''}</button></div><h3>Wallpaper</h3><div class="wallpaper-options">${[['ubuntu', 'Aubergine'], ['dusk', 'Dusk'], ['forest', 'Forest']].map(([key, label]) => `<button class="wallpaper-option ${wallpaper === key ? 'chosen' : ''}" data-wallpaper-choice="${key}" aria-label="${label} wallpaper" aria-pressed="${wallpaper === key}"><span class="swatch swatch-${key}">${wallpaper === key ? icon('check') : ''}</span>${label}</button>`).join('')}</div><div class="settings-tip">${icon('terminal')} <span>Keyboard shortcut <kbd>Ctrl</kbd> + <kbd>\`</kbd> opens the terminal.</span></div><p class="settings-caption">Theme: Yaru · Ubuntu community<br><a href="/public/yaru/ATTRIBUTION.md" target="_blank" rel="noopener noreferrer">Icon credits &amp; license ↗</a></p></article>`;
}

const readme = `Welcome to ${profile.name}'s personal desktop.\n\nOpen the apps in the dock or explore the folders.\nDrag title bars to move windows. Double-click to maximize.\nTry “help” in the terminal for a few handy commands.\n\nMake yourself at home.`;
const terminalFiles = { 'about.txt': `${profile.name}\n${profile.bio}`, 'contact.txt': `${profile.email}\n${profile.phone}\n${profile.linkedin}\n${profile.github}`, 'README.txt': readme };
function renderTerminal() {
  const el = windows.get('terminal').el;
  $('.window-body', el).innerHTML = `<div class="terminal-screen"><div class="terminal-output" role="log" aria-live="polite"><div class="terminal-banner">${escape(profile.username)}@personal-desktop <span>— a tiny terminal on the web</span></div><div>Welcome in. Type <span class="terminal-highlight">help</span> to see what you can do.</div><div class="terminal-dim">This is a portfolio terminal. No actual shell, just a little curiosity.</div></div><form class="terminal-form" autocomplete="off"><label for="terminal-command"><span class="terminal-user">${escape(profile.username)}@desktop</span>:<span class="terminal-path">~</span>$</label><input id="terminal-command" class="terminal-input" aria-label="Terminal command" autocomplete="off" spellcheck="false" autocapitalize="off" /></form></div>`;
  const history = [];
  let historyIndex = 0;
  let draft = '';
  const input = $('.terminal-input', el);
  const output = $('.terminal-output', el);
  $('.terminal-form', el).addEventListener('submit', e => {
    e.preventDefault();
    const command = input.value.trim();
    input.value = '';
    if (!command) return;
    history.push(command); historyIndex = history.length; draft = '';
    const line = document.createElement('div');
    line.className = 'terminal-history-line';
    line.innerHTML = `<span class="terminal-user">${escape(profile.username)}@desktop</span>:<span class="terminal-path">~</span>$ ${escape(command)}`;
    output.append(line);
    const result = executeCommand(command);
    if (result === null) output.innerHTML = '';
    else { const response = document.createElement('pre'); response.textContent = result; output.append(response); }
    $('.terminal-screen', el).scrollTop = $('.terminal-screen', el).scrollHeight;
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === history.length) draft = input.value;
      historyIndex = Math.min(history.length, Math.max(0, historyIndex + (e.key === 'ArrowUp' ? -1 : 1)));
      input.value = historyIndex === history.length ? draft : history[historyIndex];
    }
    if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); output.innerHTML = ''; }
    if (e.key === 'Tab') {
      e.preventDefault();
      const commands = ['help', 'whoami', 'about', 'ls', 'pwd', 'cat', 'clear', 'date', 'contact', 'projects', 'open', 'echo', 'uname'];
      const matches = commands.filter(c => c.startsWith(input.value));
      if (matches.length === 1) input.value = matches[0] + ' ';
    }
  });
}

function executeCommand(command) {
  const [cmd, ...args] = command.split(/\s+/);
  switch (cmd.toLowerCase()) {
    case 'help': return 'A few things to try:\n\n  whoami           The human behind the desktop\n  about            A short introduction\n  ls               See what’s in this folder\n  pwd              Where am I?\n  cat <file>       Read about.txt, contact.txt, README.txt\n  contact          Ways to say hello\n  projects         Open the projects folder\n  open <app>       welcome, files, terminal, contact, settings, resume,\n                   dino, snake, memory\n  date             The here and now\n  echo <text>      Say it back\n  uname            A little system info\n  clear            A fresh start\n\n↑ / ↓ command history · Tab autocomplete · Ctrl+L clear';
    case 'whoami': return profile.name;
    case 'about': return `${profile.name}\n${profile.bio}`;
    case 'pwd': return `/home/${profile.username}`;
    case 'ls': return 'About me/    Projects/    Contact/\nabout.txt    contact.txt    README.txt';
    case 'cat': return args[0] ? terminalFiles[args[0]] || `cat: ${args[0]}: No such file. Try ls.` : 'Usage: cat <file>\nTry cat about.txt';
    case 'contact': return terminalFiles['contact.txt'];
    case 'projects': openApp('files', 'Projects'); return 'Opening Projects…';
    case 'open': if (apps[args[0]]) { openApp(args[0]); return `Opening ${apps[args[0]].name}…`; } return `Choose an app: ${Object.keys(apps).join(', ')}`;
    case 'date': return new Date().toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' });
    case 'echo': return args.join(' ');
    case 'uname': return 'Personal OS 1.0 · Ubuntu-inspired · Powered by the web';
    case 'clear': return null;
    case 'sudo': return 'Nice try :) You already have everything you need here.';
    default: return `${cmd}: command not found. Type help to find your way around.`;
  }
}

function renderActivities() {
  $('#activities').innerHTML = `<div class="launcher-content"><div class="launcher-top"><h2>A little room to explore.</h2><button class="icon-button" data-action="activities" aria-label="Close applications">${icon('close')}</button></div><label class="app-search">${icon('search')}<input id="app-search" placeholder="Find an app…" aria-label="Search applications" autocomplete="off" /></label><div class="app-grid">${Object.entries(apps).map(([id, app]) => `<button class="launcher-app" data-app="${id}" data-search="${app.name.toLowerCase()}">${appIcon(id)}<strong>${app.name}</strong><span>${app.subtitle}</span></button>`).join('')}</div><p class="no-apps" hidden>No apps found. Try “files” or “terminal”.</p><p class="launcher-hint">A familiar desktop. A personal twist.</p></div>`;
  $('#app-search').addEventListener('input', e => {
    let count = 0;
    $$('.launcher-app').forEach(el => { el.hidden = !el.dataset.search.includes(e.target.value.toLowerCase().trim()); if (!el.hidden) count++; });
    $('.no-apps').hidden = count !== 0;
  });
}

function toggleActivities() {
  windows.get(active)?.game?.pause();
  closePopovers();
  $('#activities').hidden = !$('#activities').hidden;
  $('#activities-button').setAttribute('aria-expanded', String(!$('#activities').hidden));
  if (!$('#activities').hidden) { renderActivities(); $('#app-search').focus(); }
}

function closePopovers() {
  $('#calendar').hidden = true;
  $('#system-menu').hidden = true;
  $('#clock-button').setAttribute('aria-expanded', 'false');
  $('#system-button').setAttribute('aria-expanded', 'false');
}

function renderCalendar() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  $('#calendar').innerHTML = `<div class="calendar-date">${now.toLocaleDateString(undefined, { weekday: 'long' })}</div><h3>${now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</h3><div class="calendar-grid">${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<span class="calendar-day">${d}</span>`).join('')}${Array.from({ length: first }, () => '<span></span>').join('')}${Array.from({ length: days }, (_, i) => `<span class="${i + 1 === now.getDate() ? 'today' : ''}">${i + 1}</span>`).join('')}</div><div class="calendar-note">A good day to make something.</div>`;
}

function tick() {
  const now = new Date();
  $('#clock-button').textContent = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}  ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  $('#clock-button').setAttribute('aria-label', `${now.toLocaleString()}. Open calendar`);
}

function startBoot(replay = false) {
  if (replay) windows.get(active)?.game?.pause();
  let visited = false;
  try { visited = sessionStorage.getItem('desktop-booted') === 'true'; } catch { /* Boot still works without storage. */ }
  if ((!replay && visited) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $('#boot')?.remove();
    $('#desktop').inert = false;
    return;
  }
  let boot = $('#boot');
  if (!boot) {
    boot = document.createElement('section');
    boot.id = 'boot';
    boot.className = 'boot-screen';
    boot.setAttribute('aria-label', 'Starting your personal desktop');
    boot.innerHTML = bootMarkup;
    document.body.append(boot);
  }
  $('#desktop').inert = true;
  $('#skip-boot').focus({ preventScroll: true });
  let done = false;
  const timers = [];
  const finish = () => {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    try { sessionStorage.setItem('desktop-booted', 'true'); } catch { /* Storage is optional. */ }
    boot.classList.add('boot-finished');
    $('#desktop').inert = false;
    windows.get(active)?.el.focus({ preventScroll: true });
    setTimeout(() => boot.remove(), 600);
  };
  $('#skip-boot').addEventListener('click', finish, { once: true });
  timers.push(setTimeout(() => { $('#boot-status').textContent = 'Putting everything in its place…'; }, 1000));
  timers.push(setTimeout(() => { $('#boot-status').textContent = 'Make yourself at home.'; }, 2200));
  timers.push(setTimeout(finish, 3100));
}

document.addEventListener('click', async e => {
  const target = e.target.closest('button, a');
  if (!e.target.closest('.popover, #clock-button, #system-button')) closePopovers();
  if (!target) return;
  if (target.dataset.app) { openApp(target.dataset.app); return; }
  if (target.dataset.page) { openApp('welcome', target.dataset.page); return; }
  if (target.dataset.folder) { renderFiles(target.dataset.folder); return; }
  if (target.dataset.file) {
    const file = target.dataset.file;
    if (file === 'resume') openApp('resume');
    else if (file === 'projects') renderFiles('Projects');
    else if (file === 'readme') { openApp('terminal'); $('.terminal-input', windows.get('terminal').el).value = 'cat README.txt'; $('.terminal-form', windows.get('terminal').el).requestSubmit(); }
    else if (file.startsWith('project-')) { const project = profile.projects[Number(file.slice(8))]; if (project?.url && safeLink(project.url) !== '#') window.open(project.url, '_blank', 'noopener,noreferrer'); }
    else openApp('welcome', file);
    return;
  }
  if (target.dataset.control) {
    const el = target.closest('.window');
    const id = el.dataset.window;
    if (target.dataset.control === 'close') { windows.get(id)?.game?.destroy(); el.remove(); windows.delete(id); selectNextWindow(); }
    if (target.dataset.control === 'minimize') { windows.get(id)?.game?.pause(); el.hidden = true; selectNextWindow(); }
    if (target.dataset.control === 'maximize') toggleMaximize(el);
    return;
  }
  if (target.dataset.themeChoice || target.dataset.wallpaperChoice) {
    if (target.dataset.themeChoice) { theme = target.dataset.themeChoice; document.documentElement.dataset.theme = theme; }
    if (target.dataset.wallpaperChoice) { wallpaper = target.dataset.wallpaperChoice; document.documentElement.dataset.wallpaper = wallpaper; }
    try { localStorage.setItem('desktop-theme', theme); localStorage.setItem('desktop-wallpaper', wallpaper); } catch { /* Storage is optional. */ }
    renderSettings();
    return;
  }
  if (target.dataset.action === 'activities' || target.id === 'activities-button') toggleActivities();
  if (target.dataset.action === 'replay-boot') { closePopovers(); startBoot(true); }
  if (target.dataset.action === 'copy-email') {
    try { await navigator.clipboard.writeText(profile.email); toast('Email copied. Say hello whenever you like.'); }
    catch { toast(`Email: ${profile.email}`); }
  }
  if (target.id === 'clock-button') {
    const wasHidden = $('#calendar').hidden;
    closePopovers();
    $('#calendar').hidden = !wasHidden;
    target.setAttribute('aria-expanded', String(wasHidden));
    renderCalendar();
  }
  if (target.id === 'system-button') {
    const wasHidden = $('#system-menu').hidden;
    closePopovers();
    $('#system-menu').hidden = !wasHidden;
    target.setAttribute('aria-expanded', String(wasHidden));
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closePopovers(); if (!$('#activities').hidden) { $('#activities').hidden = true; $('#activities-button').setAttribute('aria-expanded', 'false'); $('#activities-button').focus(); } }
  if (e.ctrlKey && e.code === 'Backquote') { e.preventDefault(); openApp('terminal'); }
});
window.addEventListener('resize', () => {
  if (window.innerWidth <= 700) return;
  for (const { el } of windows.values()) {
    if (el.classList.contains('maximized')) continue;
    el.style.width = `${Math.min(parseFloat(el.style.width), window.innerWidth - 100)}px`;
    el.style.height = `${Math.min(parseFloat(el.style.height), window.innerHeight - 85)}px`;
    el.style.left = `${Math.max(80, Math.min(parseFloat(el.style.left), window.innerWidth - el.offsetWidth - 12))}px`;
    el.style.top = `${Math.max(40, Math.min(parseFloat(el.style.top), window.innerHeight - el.offsetHeight - 12))}px`;
  }
});

$('#system-menu').innerHTML = `<div class="system-profile"><div class="avatar small">u</div><div><strong>${escape(profile.name)}</strong><span>${escape(profile.role)}</span></div></div><div id="device-status" class="device-status" aria-label="Device status"></div><button data-app="settings">${icon('settings')} Desktop settings ${icon('arrow')}</button><button data-app="contact">${icon('mail')} Say hello ${icon('arrow')}</button><button data-action="replay-boot">${icon('sun')} Replay the welcome ${icon('arrow')}</button><p>A personal website in desktop clothing.</p>`;
initSystemStatus($('#system-button'), $('#device-status'));
$('#desktop-shortcuts').innerHTML = [['files', 'Home'], ['files', 'Projects'], ['resume', 'Résumé'], ['dino', 'Dino Run'], ['snake', 'Snake'], ['memory', 'Memory']].map(([id, title]) => `<button class="desktop-shortcut ${apps[id]?.game ? 'game-shortcut' : ''}" ${title === 'Projects' ? 'data-desktop-projects="true"' : `data-app="${id}"`}>${appIcon(title === 'Home' ? 'home' : id)}<span>${title}</span></button>`).join('');
$('[data-desktop-projects]').addEventListener('click', () => openApp('files', 'Projects'));
renderDock();
tick();
setInterval(tick, 15000);
openApp('welcome');
startBoot();
