import { icon } from './icons.js';

// Browser-reported state only. Connection speed is not Wi-Fi signal strength,
// and media-element volume is not the laptop's master volume.
export function networkState(nav) {
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  const type = connection?.type;
  if (nav.onLine === false || type === 'none') {
    return { state: 'offline', title: 'Network', value: 'Offline', detail: 'Your browser reports no network connection.', icon: 'network-offline' };
  }
  if (nav.onLine !== true) {
    return { state: 'unknown', title: 'Network', value: 'Unavailable', detail: 'Connection status is not shared by this browser.', icon: 'network' };
  }
  const names = { wifi: 'Wi-Fi', ethernet: 'Ethernet', cellular: 'Mobile network', bluetooth: 'Bluetooth network', wimax: 'WiMAX' };
  return {
    state: 'online', title: names[type] || 'Network', value: 'Online', icon: 'network',
    detail: type === 'wifi' ? 'Signal strength is not available to websites.' : 'Browser-reported connection. Internet access may vary.',
  };
}

export function batteryState(battery) {
  if (!battery || typeof battery.level !== 'number' || !Number.isFinite(battery.level) || battery.level < 0 || battery.level > 1 || typeof battery.charging !== 'boolean') return null;
  const percent = Math.round(battery.level * 100);
  return {
    percent, charging: battery.charging, low: !battery.charging && percent <= 20,
    value: `${percent}% · ${battery.charging ? percent === 100 ? 'Plugged in' : 'Charging' : 'On battery'}`,
  };
}

function batteryIcon(battery) {
  const fill = battery ? Math.round(15 * battery.percent / 100 * 10) / 10 : 0;
  const symbol = !battery
    ? '<path d="M8.5 9a2 2 0 1 1 3.4 1.4c-.8.5-1.4 1-1.4 2.1"/><path d="M10.5 15h.01"/>'
    : battery.charging ? '<path d="m12 7-4 5h4l-3 5 7-7h-5z" fill="var(--battery-bolt, #333)" stroke="none"/>' : '';
  return `<svg class="icon live-battery-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="5" width="19" height="14" rx="2"/><path d="M23 9v6"/>${battery ? `<rect x="3.5" y="7" width="${fill}" height="10" rx=".5" fill="currentColor" stroke="none"/>` : ''}${symbol}</svg>`;
}

export function initSystemStatus(button, container) {
  const controller = new AbortController();
  const listen = (target, event, handler) => target?.addEventListener?.(event, handler, { signal: controller.signal });
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  let battery = null;
  let batteryManager = null;
  let batteryStatus = typeof navigator.getBattery === 'function' ? 'loading' : 'unavailable';

  function render() {
    const network = networkState(navigator);
    const batteryLabel = battery?.value || (batteryStatus === 'loading' ? 'Checking…' : 'Unavailable');
    const batteryDetail = battery ? 'Reported by this device’s browser.' : batteryStatus === 'loading' ? 'Reading the device battery.' : 'This browser does not share battery information.';
    const networkTip = `${network.title}: ${network.value}. ${network.detail}`;
    button.title = `${network.title}: ${network.value} · Battery: ${batteryLabel} · System volume unavailable`;
    button.setAttribute('aria-description', button.title);
    button.innerHTML = `<span class="panel-status network-status ${network.state}" title="${networkTip}">${icon(network.icon)}</span><span class="panel-status sound-status unavailable" title="System volume is not available to websites. Use your laptop’s volume keys.">${icon('speaker')}<span class="unknown-mark">?</span></span><span class="panel-status battery-status ${battery ? battery.low ? 'low' : battery.charging ? 'charging' : '' : 'unavailable'}" title="Battery: ${batteryLabel}">${batteryIcon(battery)}${battery ? `<span class="battery-percentage">${battery.percent}%</span>` : ''}</span>${icon('chevron')}`;
    container.innerHTML = `<div class="device-status-row" data-device="network" data-state="${network.state}">${icon(network.icon)}<div><div class="device-status-label"><strong>${network.title}</strong><span>${network.value}</span></div><p>${network.detail}</p></div></div><div class="device-status-row" data-device="sound" data-state="unavailable">${icon('speaker')}<div><div class="device-status-label"><strong>System sound</strong><span>Managed by laptop</span></div><p>Use your laptop’s volume keys. Websites can’t read its volume or mute setting.</p></div></div><div class="device-status-row ${battery?.low ? 'low' : ''}" data-device="battery" data-state="${battery ? 'available' : batteryStatus}">${batteryIcon(battery)}<div><div class="device-status-label"><strong>Battery</strong><span>${batteryLabel}</span></div><p>${batteryDetail}</p></div></div>`;
  }
  function refresh() { battery = batteryState(batteryManager); render(); }
  listen(window, 'online', render);
  listen(window, 'offline', render);
  listen(connection, 'change', render);
  listen(window, 'focus', refresh);
  listen(document, 'visibilitychange', () => { if (!document.hidden) refresh(); });
  render();
  if (batteryStatus === 'loading') {
    Promise.resolve().then(() => navigator.getBattery()).then(manager => {
      if (controller.signal.aborted) return;
      batteryManager = manager;
      batteryStatus = 'unavailable';
      for (const event of ['levelchange', 'chargingchange']) listen(manager, event, refresh);
      refresh();
    }).catch(() => { if (!controller.signal.aborted) { batteryStatus = 'unavailable'; refresh(); } });
  }
  return { destroy() { controller.abort(); } };
}
