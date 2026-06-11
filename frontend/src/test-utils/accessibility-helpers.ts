import { fireEvent } from '@testing-library/react';
import { expect } from 'vitest';

/**
 * Triggers a tab key press on the target element.
 */
export function triggerTabKey(element: HTMLElement, shiftKey = false) {
  fireEvent.keyDown(element, {
    key: 'Tab',
    code: 'Tab',
    keyCode: 9,
    which: 9,
    shiftKey,
  });
}

/**
 * Verifies that the active element is the expected element.
 */
export function assertActiveElement(element: HTMLElement) {
  expect(document.activeElement).toBe(element);
}

/**
 * Dispatches keypress events like Enter or Space.
 */
export function triggerKeyboardSubmit(element: HTMLElement, key: 'Enter' | ' ') {
  fireEvent.keyDown(element, { key, code: key === 'Enter' ? 'Enter' : 'Space' });
}

/**
 * Verifies that an element with aria-live="polite" exists and contains specific text.
 */
export function assertLiveAnnouncement(text: string | RegExp) {
  const announcements = document.querySelectorAll('[aria-live="polite"], [aria-live="assertive"]');
  let found = false;
  
  announcements.forEach((el) => {
    if (el.textContent && (typeof text === 'string' ? el.textContent.includes(text) : text.test(el.textContent))) {
      found = true;
    }
  });

  expect(found).toBe(true);
}
