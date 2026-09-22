// Pure rules shared by the games and their tests.
export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function moveSnake(body, direction, food, size) {
  const head = { x: body[0].x + direction.x, y: body[0].y + direction.y };
  const ate = head.x === food?.x && head.y === food?.y;
  const occupied = ate ? body : body.slice(0, -1);
  if (head.x < 0 || head.y < 0 || head.x >= size || head.y >= size || occupied.some(p => p.x === head.x && p.y === head.y)) {
    return { body, ate: false, dead: true };
  }
  return { body: [head, ...body.slice(0, ate ? undefined : -1)], ate, dead: false };
}

export function placeFood(body, size, random = Math.random) {
  const free = [];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (!body.some(p => p.x === x && p.y === y)) free.push({ x, y });
  }
  return free.length ? free[Math.floor(random() * free.length)] : null;
}

export function shuffledPairs(count, random = Math.random) {
  const cards = Array.from({ length: count * 2 }, (_, i) => i % count);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}
