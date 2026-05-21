import { expect } from 'vitest';

/**
 * Sets document direction to RTL.
 */
export function setDirectionRtl() {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
}

/**
 * Sets document direction to LTR.
 */
export function setDirectionLtr() {
  document.documentElement.dir = 'ltr';
  document.documentElement.lang = 'en';
}

/**
 * Asserts document direction is RTL.
 */
export function assertDocumentIsRtl() {
  expect(document.documentElement.dir).toBe('rtl');
  expect(document.documentElement.lang).toBe('ar');
}

/**
 * Asserts document direction is LTR.
 */
export function assertDocumentIsLtr() {
  expect(document.documentElement.dir).toBe('ltr');
  expect(document.documentElement.lang).toBe('en');
}
