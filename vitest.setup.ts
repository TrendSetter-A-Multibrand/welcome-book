/**
 * Два браузерных API, которых нет в jsdom, но которые ждут наши компоненты:
 * `matchMedia` (проверка reduced-motion) и `ResizeObserver`. Они ничего не делают:
 * тест, которому важна смена размера, пишет размер сам.
 */
// Серверные тесты (`@vitest-environment node`) идут без window
if (typeof window !== "undefined") {
  window.matchMedia = ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;
}

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;
