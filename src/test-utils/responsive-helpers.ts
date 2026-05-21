import { vi } from 'vitest';

/**
 * Resizes the window viewport width and fires the resize event.
 */
export function mockViewportResize(width: number, height = 768) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
}

/**
 * Mock mobile touch event support parameters.
 */
export function mockTouchSupport(supported: boolean) {
  if (supported) {
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: () => {},
    });
  } else {
    // @ts-ignore
    delete window.ontouchstart;
  }
}
