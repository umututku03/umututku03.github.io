const paths = {
  network: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  'network-offline': '<path d="M5.6 5.6A9 9 0 0 0 18.4 18.4M9 3.5A9 9 0 0 1 20.5 15M8 8c-1 4-1 8 4 13M12 3c3 2 4 5 4 8M3 12h9M2 2l20 20"/>',
  speaker: '<path d="m12 4-6 5H3v6h3l6 5z"/><path d="M17 9h.01M17 12h.01M17 15h.01"/>',
  dino: '<path d="M11 4h9v6h-6v4h4m-4-4v8H7L3 12V8l4 6h4M8 18v3h3m2-3v3h3"/><path d="M15 6h1"/>',
  snake: '<path d="M4 19h8v-7H6V5h12v9"/><rect x="15" y="12" width="6" height="6" rx="2"/>',
  memory: '<rect x="3" y="6" width="10" height="15" rx="2"/><rect x="11" y="3" width="10" height="15" rx="2"/><path d="m16 7 1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',
  github: '<path d="M9 20c-5 1-5-3-7-3m14 5v-4c0-1-.3-2-1-2.5 4-.5 7-2 7-6a5 5 0 0 0-1.5-3.5c.3-1 .3-2-.2-3-2 0-3.5 1-4.3 1.5a15 15 0 0 0-8 0C7.2 4 5.7 3 3.7 3c-.5 1-.5 2-.2 3A5 5 0 0 0 2 9.5c0 4 3 5.5 7 6-.7.5-1 1.5-1 2.5v4"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7m0-10v.01M11 17v-7m0 3a3 3 0 0 1 6 0v4"/>',
};
// Yaru assets: © Yaru contributors, CC BY-SA 4.0. See public/yaru/ATTRIBUTION.md.
const symbolic = new Set(['home', 'user', 'folder', 'terminal', 'mail', 'file', 'settings', 'grid', 'search', 'arrow', 'back', 'external', 'phone', 'wifi', 'volume', 'battery', 'chevron', 'close', 'minimize', 'maximize', 'check', 'copy', 'sun', 'moon', 'heart']);
export function icon(name, cls = '') {
  if (symbolic.has(name)) return `<span class="icon yaru-symbolic ${cls}" style="--symbol:url('/public/yaru/symbolic/${name}.svg')" aria-hidden="true"></span>`;
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`;
}
export function appIcon(name) {
  if (['dino', 'snake', 'memory'].includes(name)) return `<img class="app-icon game-app-icon" src="/public/games/${name}.svg" alt="" draggable="false" width="48" height="48" />`;
  const asset = { welcome: 'welcome', files: 'files', projects: 'files', home: 'home', terminal: 'terminal', contact: 'contact', settings: 'settings', resume: 'resume', text: 'text', about: 'home' }[name] || 'text';
  return `<img class="app-icon yaru-app-icon" src="/public/yaru/icons/${asset}.png" alt="" draggable="false" width="48" height="48" />`;
}
