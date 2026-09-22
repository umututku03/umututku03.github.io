import { appIcon } from './icons.js';
import { overlaps, moveSnake, placeFood, shuffledPairs } from './game-logic.js';

export const gameApps = {
  dino: { name: 'Dino Run', subtitle: 'Small dinosaur. Big ambitions.', icon: 'dino', game: true },
  snake: { name: 'Snake', subtitle: 'One more bite.', icon: 'snake', game: true },
  memory: { name: 'Memory', subtitle: 'Find your perfect match.', icon: 'memory', game: true },
};

function readBest(id) {
  try { return Math.max(0, Number(localStorage.getItem(`game-best-${id}`)) || 0); } catch { return 0; }
}
function saveBest(id, score) {
  try { localStorage.setItem(`game-best-${id}`, String(score)); } catch { /* Games work without storage. */ }
}

export function mountGame(id, root) {
  const app = gameApps[id];
  root.innerHTML = `<div class="game-app game-${id}" data-state="ready"><div class="game-heading">${appIcon(id)}<div><h2>${app.name}</h2><p>${app.subtitle}</p></div><span class="game-badge">A LITTLE BREAK</span></div><div class="game-toolbar"><div class="game-stats"><span>${id === 'memory' ? 'Moves' : 'Score'} <strong class="game-score">0</strong></span><span>${id === 'memory' ? 'Pairs' : 'Best'} <strong class="game-best">${id === 'memory' ? '0 / 8' : readBest(id)}</strong></span></div><div class="game-toolbar-actions"><button class="secondary-button" data-game="pause" disabled>Pause</button><button class="secondary-button" data-game="restart">New game</button></div></div><div class="game-stage ${id === 'snake' ? 'square-stage' : ''}">${id === 'memory' ? '<div class="memory-board" aria-label="Matching cards"></div>' : `<canvas class="game-canvas" tabindex="0" aria-label="${id === 'dino' ? 'Dinosaur runner. Press Space or Up to jump, P to pause.' : 'Snake board. Use arrow keys or WASD to move, P to pause.'}"></canvas>`}<div class="game-overlay"><div class="game-overlay-card"><span class="game-overlay-kicker">${id === 'dino' ? 'NO INTERNET? NO PROBLEM.' : id === 'snake' ? 'THE CLASSIC NEVER GETS OLD.' : 'A LITTLE EXERCISE FOR YOUR BRAIN.'}</span><h3 class="game-message">${id === 'dino' ? 'Ready, little dinosaur?' : id === 'snake' ? 'A snack-sized adventure.' : 'Great minds think in pairs.'}</h3><p class="game-message-detail">${id === 'dino' ? 'Hop over the cacti. See how far you can go.' : id === 'snake' ? 'Eat the oranges. Don’t bite your tail.' : 'Flip two cards at a time. Find all eight pairs.'}</p><button class="primary-button" data-game="play">Let's play <span aria-hidden="true">→</span></button></div></div></div><div class="game-controls">${id === 'dino' ? '<span><kbd>Space</kbd> / <kbd>↑</kbd> jump · <kbd>P</kbd> pause</span><button class="secondary-button jump-button" data-game="jump">Jump ↑</button>' : id === 'snake' ? '<span><kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd> or WASD · <kbd>P</kbd> pause</span><div class="snake-pad" aria-label="Direction controls"><button data-direction="up" aria-label="Move up">↑</button><button data-direction="left" aria-label="Move left">←</button><button data-direction="down" aria-label="Move down">↓</button><button data-direction="right" aria-label="Move right">→</button></div>' : '<span>Pick a card, then find its twin.</span><span class="memory-timer">0:00</span>'}</div><p class="game-footnote">${id === 'dino' ? 'Inspired by the offline dinosaur. Playable online, too.' : 'No downloads. No rush. Just one more round.'}</p><div class="game-announcement sr-only" role="status" aria-live="polite"></div></div>`;
  const shell = root.querySelector('.game-app');
  const find = s => root.querySelector(s);
  const events = new AbortController();
  const listen = (target, type, callback) => target.addEventListener(type, callback, { signal: events.signal });
  let state = 'ready';
  let disposed = false;
  let score = 0;
  let best = readBest(id);
  let frame = 0;
  let previous = 0;
  let elapsed = 0;
  let engine;

  function setState(next) {
    state = next;
    shell.dataset.state = next;
    find('[data-game="pause"]').disabled = !['running', 'paused'].includes(next);
    find('[data-game="pause"]').textContent = next === 'paused' ? 'Resume' : 'Pause';
    find('.game-overlay').hidden = next === 'running';
    if (id === 'memory') find('.memory-board').inert = next !== 'running';
  }
  function updateScore(value) {
    score = value;
    find('.game-score').textContent = value;
    if (id !== 'memory' && score > best) {
      best = score;
      find('.game-best').textContent = best;
    }
  }
  function showMessage(title, detail, action) {
    find('.game-message').textContent = title;
    find('.game-message-detail').textContent = detail;
    find('[data-game="play"]').textContent = action;
    find('.game-announcement').textContent = `${title} ${detail}`;
  }
  function stop() { cancelAnimationFrame(frame); previous = 0; }
  function tick(time) {
    if (disposed || state !== 'running') return;
    const dt = previous ? Math.min((time - previous) / 1000, .05) : 0;
    previous = time;
    elapsed += dt;
    engine.update(dt, elapsed);
    engine.draw();
    if (state === 'running') frame = requestAnimationFrame(tick);
  }
  function start() {
    if (disposed) return;
    stop();
    elapsed = 0;
    updateScore(0);
    engine.reset();
    setState('running');
    engine.draw();
    frame = requestAnimationFrame(tick);
    find('.game-canvas')?.focus({ preventScroll: true });
    if (id === 'memory') find('.memory-card')?.focus({ preventScroll: true });
  }
  function pause() {
    if (state !== 'running') return;
    stop();
    if (id !== 'memory') saveBest(id, best);
    setState('paused');
    showMessage('Taking a breather.', 'Your game is right here when you’re ready.', 'Keep playing →');
  }
  function resume() {
    if (state !== 'paused') return;
    setState('running');
    previous = 0;
    frame = requestAnimationFrame(tick);
    find('.game-canvas')?.focus({ preventScroll: true });
  }
  function finish(won = false) {
    stop();
    if (id !== 'memory') saveBest(id, best);
    setState(won ? 'won' : 'over');
    showMessage(won ? 'Nicely done!' : id === 'dino' ? 'One cactus too many.' : 'That’s a wrap.', id === 'memory' ? `All 8 pairs in ${score} moves and ${formatTime(elapsed)}. Another round?` : `You scored ${score}. ${score >= best && score > 0 ? 'A personal best!' : 'There’s always another round.'}`, 'Play again →');
  }
  const controls = { find, listen, updateScore, finish, isRunning: () => state === 'running' };
  engine = id === 'dino' ? makeDino(controls) : id === 'snake' ? makeSnake(controls) : makeMemory(controls);
  engine.reset();
  engine.draw();
  setState('ready');

  listen(root, 'click', e => {
    const button = e.target.closest('button');
    if (!button) return;
    const action = button.dataset.game;
    if (action === 'play') state === 'paused' ? resume() : start();
    if (action === 'restart') start();
    if (action === 'pause') state === 'paused' ? resume() : pause();
    if (action === 'jump') { if (state === 'ready' || state === 'over') start(); if (state === 'running') engine.jump?.(); }
    if (button.dataset.direction && state === 'running') engine.turn?.(button.dataset.direction);
  });
  listen(root, 'keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest('.window-controls')) return;
    if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
      if (['running', 'paused'].includes(state)) { e.preventDefault(); e.stopPropagation(); state === 'running' ? pause() : resume(); }
      return;
    }
    // Buttons keep their native Space/Enter activation. Game keys act on the board.
    if (e.target.closest('button')) return;
    if (id === 'dino' && [' ', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      if (e.repeat) return;
      if (state === 'paused') resume();
      else { if (state !== 'running') start(); engine.jump(); }
    }
    const direction = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' }[e.key];
    if (id === 'snake' && direction) {
      e.preventDefault();
      if (state === 'ready') start();
      if (state === 'running') engine.turn(direction);
    }
  });
  listen(window, 'blur', pause);
  listen(document, 'visibilitychange', () => { if (document.hidden) pause(); });
  return {
    pause,
    destroy() { disposed = true; stop(); events.abort(); if (id !== 'memory') saveBest(id, best); },
  };
}

function formatTime(seconds) { return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`; }
function canvasContext(canvas, width, height) {
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);
  return ctx;
}

function makeDino({ find, listen, updateScore, finish, isRunning }) {
  const canvas = find('canvas');
  const ctx = canvasContext(canvas, 760, 260);
  const ground = 209;
  let y, velocity, obstacles, distance, spawn, speed, time;
  function reset() { y = 0; velocity = 0; obstacles = []; distance = 0; spawn = 1.5; speed = 270; time = 0; }
  function jump() { if (y === 0) velocity = 650; }
  listen(canvas, 'pointerdown', () => { canvas.focus({ preventScroll: true }); if (isRunning()) jump(); });
  function update(dt) {
    time += dt;
    speed = Math.min(500, 270 + time * 3.5);
    distance += speed * dt;
    updateScore(Math.floor(distance / 30));
    y = Math.max(0, y + velocity * dt);
    velocity -= 1800 * dt;
    if (y === 0) velocity = Math.max(velocity, 0);
    spawn -= dt;
    if (spawn <= 0) {
      const h = 30 + Math.floor(Math.random() * 20);
      obstacles.push({ x: 780, y: ground - h, w: 18 + Math.floor(Math.random() * 10), h });
      spawn = 1.2 + Math.random() * .65;
    }
    obstacles.forEach(o => { o.x -= speed * dt; });
    obstacles = obstacles.filter(o => o.x + o.w > -10);
    const player = { x: 75, y: ground - y - 43, w: 27, h: 39 };
    if (obstacles.some(o => overlaps(player, { x: o.x + 3, y: o.y + 3, w: o.w - 6, h: o.h - 3 }))) finish();
  }
  function draw() {
    ctx.fillStyle = '#faf8f1'; ctx.fillRect(0, 0, 760, 260);
    ctx.fillStyle = '#ecdab3'; ctx.beginPath(); ctx.arc(645, 60, 22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#dedacc'; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const x = ((i * 240 + 100 - distance * .12) % 960 + 960) % 960 - 100;
      const cy = 55 + (i % 2) * 36;
      ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x + 12, cy); ctx.quadraticCurveTo(x + 10, cy - 10, x + 21, cy - 10); ctx.quadraticCurveTo(x + 34, cy - 23, x + 41, cy - 8); ctx.quadraticCurveTo(x + 53, cy - 11, x + 53, cy); ctx.lineTo(x + 65, cy); ctx.stroke();
    }
    ctx.strokeStyle = '#c6c4b6'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, ground + 1); ctx.lineTo(760, ground + 1); ctx.stroke();
    ctx.fillStyle = '#d8d4c8';
    for (let i = 0; i < 20; i++) ctx.fillRect(((i * 57 - distance) % 800 + 800) % 800, ground + 9 + i % 3 * 6, i % 2 ? 5 : 12, 2);
    ctx.fillStyle = '#71896a';
    for (const o of obstacles) {
      ctx.fillRect(o.x + o.w / 2 - 4, o.y, 8, o.h);
      ctx.fillRect(o.x, o.y + 9, 5, o.h * .48); ctx.fillRect(o.x, o.y + o.h * .48, o.w / 2, 5);
      ctx.fillRect(o.x + o.w - 5, o.y + 5, 5, o.h * .45); ctx.fillRect(o.x + o.w / 2, o.y + o.h * .45, o.w / 2, 5);
    }
    const px = 68, py = ground - 47 - y;
    ctx.fillStyle = '#465847';
    ctx.fillRect(px + 18, py, 25, 19); ctx.fillRect(px + 12, py + 15, 18, 22);
    ctx.fillRect(px + 4, py + 22, 14, 11); ctx.fillRect(px, py + 13, 5, 13);
    ctx.fillRect(px + 27, py + 23, 9, 4); ctx.fillRect(px + 33, py + 25, 3, 5);
    const step = y > 0 ? 0 : Math.floor(time * 12) % 2 * 5;
    ctx.fillRect(px + 12, py + 34, 5, 13 - step); ctx.fillRect(px + 12, py + 43 - step, 10, 4);
    ctx.fillRect(px + 25, py + 34, 5, 8 + step); ctx.fillRect(px + 25, py + 38 + step, 9, 4);
    ctx.fillStyle = '#faf8f1'; ctx.fillRect(px + 24, py + 4, 4, 4); ctx.fillRect(px + 32, py + 13, 11, 3);
  }
  return { reset, update, draw, jump };
}

function makeSnake({ find, listen, updateScore, finish, isRunning }) {
  const canvas = find('canvas');
  const ctx = canvasContext(canvas, 400, 400);
  const size = 20, cell = 20;
  let body, direction, next, food, score, accumulator, turned;
  const directions = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
  function reset() {
    body = [{ x: 7, y: 10 }, { x: 6, y: 10 }, { x: 5, y: 10 }];
    direction = directions.right; next = direction; food = placeFood(body, size); score = 0; accumulator = 0; turned = false;
  }
  function turn(name) {
    const wanted = directions[name];
    if (turned || !wanted || (wanted.x === -direction.x && wanted.y === -direction.y)) return;
    next = wanted; turned = true;
  }
  let touchStart;
  listen(canvas, 'pointerdown', e => { canvas.focus({ preventScroll: true }); touchStart = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
  listen(canvas, 'pointerup', e => {
    if (!touchStart || !isRunning()) return;
    const dx = e.clientX - touchStart.x, dy = e.clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 10) return;
    turn(Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'right' : 'left' : dy > 0 ? 'down' : 'up');
  });
  function update(dt) {
    accumulator += dt;
    const interval = Math.max(.085, .17 - score * .004);
    if (accumulator < interval) return;
    accumulator -= interval;
    direction = next; turned = false;
    const result = moveSnake(body, direction, food, size);
    if (result.dead) { finish(); return; }
    body = result.body;
    if (result.ate) { updateScore(++score); food = placeFood(body, size); if (!food) finish(true); }
  }
  function draw() {
    ctx.fillStyle = '#f0f2e9'; ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#e8eddf';
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if ((x + y) % 2 === 0) ctx.fillRect(x * cell, y * cell, cell, cell);
    if (food) {
      ctx.fillStyle = '#e97835'; ctx.beginPath(); ctx.arc(food.x * cell + 10, food.y * cell + 11, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#618c43'; ctx.fillRect(food.x * cell + 10, food.y * cell + 1, 5, 4);
    }
    body.forEach((part, index) => {
      ctx.fillStyle = index === 0 ? '#395e3e' : '#6a9454';
      ctx.beginPath(); ctx.roundRect(part.x * cell + 1, part.y * cell + 1, 18, 18, index === 0 ? 5 : 3); ctx.fill();
    });
    const h = body[0]; ctx.fillStyle = '#fffde9';
    if (direction.x) { const x = h.x * cell + (direction.x > 0 ? 13 : 4); ctx.fillRect(x, h.y * cell + 4, 3, 3); ctx.fillRect(x, h.y * cell + 13, 3, 3); }
    else { const y = h.y * cell + (direction.y > 0 ? 13 : 4); ctx.fillRect(h.x * cell + 4, y, 3, 3); ctx.fillRect(h.x * cell + 13, y, 3, 3); }
  }
  return { reset, update, draw, turn };
}

function makeMemory({ find, listen, updateScore, finish, isRunning }) {
  const board = find('.memory-board');
  const symbols = ['🍊', '🚀', '🌵', '🎧', '🦕', '🌈', '🍄', '⭐'];
  const names = ['Orange', 'Rocket', 'Cactus', 'Headphones', 'Dinosaur', 'Rainbow', 'Mushroom', 'Star'];
  let deck, selected, matches, moves, lockTime;
  function reset() {
    deck = shuffledPairs(8); selected = []; matches = 0; moves = 0; lockTime = 0;
    find('.game-best').textContent = '0 / 8'; find('.memory-timer').textContent = '0:00';
    board.innerHTML = deck.map((value, index) => `<button class="memory-card" data-card="${index}" aria-label="Card ${index + 1}, face down"><span class="card-back" aria-hidden="true">✳</span><span class="card-face" aria-hidden="true">${symbols[value]}</span></button>`).join('');
  }
  function conceal() {
    for (const index of selected) {
      const button = board.children[index];
      button.classList.remove('flipped');
      button.setAttribute('aria-label', `Card ${index + 1}, face down`);
    }
    selected = []; lockTime = 0;
  }
  listen(board, 'click', e => {
    const button = e.target.closest('[data-card]');
    if (!button || !isRunning() || lockTime > 0 || button.classList.contains('matched')) return;
    const index = Number(button.dataset.card);
    if (selected.includes(index)) return;
    selected.push(index); button.classList.add('flipped'); button.setAttribute('aria-label', names[deck[index]]);
    if (selected.length !== 2) return;
    updateScore(++moves);
    if (deck[selected[0]] === deck[selected[1]]) {
      selected.forEach(i => { board.children[i].classList.add('matched'); board.children[i].setAttribute('aria-label', `${names[deck[i]]}, matched`); board.children[i].setAttribute('aria-disabled', 'true'); });
      selected = []; matches++;
      find('.game-best').textContent = `${matches} / 8`;
      find('.game-announcement').textContent = `Match found. ${matches} of 8 pairs.`;
      if (matches === 8) finish(true);
    } else lockTime = .9;
  });
  function update(dt, elapsed) {
    find('.memory-timer').textContent = formatTime(elapsed);
    if (lockTime > 0) { lockTime -= dt; if (lockTime <= 0) conceal(); }
  }
  return { reset, update, draw() {} };
}
