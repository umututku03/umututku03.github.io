import test from 'node:test';
import assert from 'node:assert/strict';
import { overlaps, moveSnake, placeFood, shuffledPairs } from '../src/game-logic.js';

test('runner collisions require overlapping hitboxes', () => {
  const cactus = { x: 80, y: 170, w: 20, h: 40 };
  assert.equal(overlaps({ x: 75, y: 166, w: 27, h: 39 }, cactus), true);
  assert.equal(overlaps({ x: 75, y: 80, w: 27, h: 39 }, cactus), false);
  assert.equal(overlaps({ x: 53, y: 170, w: 27, h: 39 }, cactus), false);
});

test('snake moves, grows after eating, and stops at walls', () => {
  const body = [{ x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }];
  const moved = moveSnake(body, { x: 1, y: 0 }, { x: 0, y: 0 }, 5);
  assert.deepEqual(moved.body, [{ x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }]);
  const fed = moveSnake(body, { x: 1, y: 0 }, { x: 4, y: 2 }, 5);
  assert.equal(fed.ate, true);
  assert.equal(fed.body.length, 4);
  assert.equal(moveSnake(fed.body, { x: 1, y: 0 }, { x: 0, y: 0 }, 5).dead, true);
  assert.equal(body.length, 3, 'input body is not mutated');
});

test('snake can enter its vacating tail but cannot hit its body', () => {
  const body = [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 2 }];
  assert.equal(moveSnake(body, { x: -1, y: 0 }, { x: 4, y: 4 }, 5).dead, false);
  assert.equal(moveSnake(body, { x: 0, y: 1 }, { x: 4, y: 4 }, 5).dead, true);
});

test('food only occupies free cells and full boards terminate', () => {
  const body = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }];
  assert.deepEqual(placeFood(body, 2), { x: 1, y: 1 });
  assert.equal(placeFood([...body, { x: 1, y: 1 }], 2), null);
});

test('memory decks preserve exactly two of every card', () => {
  for (let trial = 0; trial < 20; trial++) {
    const deck = shuffledPairs(8);
    assert.equal(deck.length, 16);
    for (let card = 0; card < 8; card++) assert.equal(deck.filter(value => value === card).length, 2);
  }
});
