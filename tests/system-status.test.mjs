import test from 'node:test';
import assert from 'node:assert/strict';
import { networkState, batteryState } from '../src/system-status.js';

test('network uses reported connectivity without guessing Wi-Fi from connection speed', () => {
  const generic = networkState({ onLine: true, connection: { effectiveType: '4g' } });
  assert.equal(generic.title, 'Network');
  assert.equal(generic.state, 'online');
  assert.equal(networkState({ onLine: true, connection: { type: 'wifi' } }).title, 'Wi-Fi');
  assert.equal(networkState({ onLine: true, connection: { type: 'ethernet' } }).title, 'Ethernet');
  assert.equal(networkState({ onLine: false, connection: { type: 'wifi' } }).state, 'offline');
  assert.equal(networkState({ onLine: true, connection: { type: 'none' } }).state, 'offline');
  assert.equal(networkState({}).state, 'unknown');
});

test('battery handles charge, low power, and full battery using reported values', () => {
  assert.deepEqual(batteryState({ level: .426, charging: false }), { percent: 43, charging: false, low: false, value: '43% · On battery' });
  assert.equal(batteryState({ level: .15, charging: false }).low, true);
  assert.equal(batteryState({ level: .15, charging: true }).low, false);
  assert.equal(batteryState({ level: 0, charging: true }).value, '0% · Charging');
  assert.equal(batteryState({ level: 1, charging: true }).value, '100% · Plugged in');
});

test('unavailable or invalid battery data never becomes a fabricated reading', () => {
  for (const battery of [null, undefined, {}, { level: NaN, charging: true }, { level: 1.1, charging: false }, { level: -.1, charging: true }, { level: '0.5', charging: true }, { level: .5 }]) {
    assert.equal(batteryState(battery), null);
  }
});
