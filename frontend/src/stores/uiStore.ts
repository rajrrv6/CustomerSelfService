'use client';

/**
 * uiStore — Zustand store for cross-feature UI state.
 *
 * Owns: lang, theme, activeScreen
 *
 * These slices are consumed across portals to coordinate interface parameters
 * without forcing layout re-renders on every context change.
 */

import { create } from 'zustand';

type Lang = 'en' | 'ar';
type Theme = 'light' | 'dark' | 'system';

interface UIState {
  lang: Lang;
  theme: Theme;
  activeScreen: string;
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
  setActiveScreen: (screen: string) => void;
}

/** Resolve 'system' theme to the actual dark/light value */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }
  return theme;
}

/** Apply dark/light class to <html> */
function applyThemeToDom(theme: Theme): void {
  if (typeof window === 'undefined') return;
  const root = window.document.documentElement;
  const resolved = resolveTheme(theme);
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

/** Apply RTL/LTR direction to <html> */
function applyLangToDom(lang: Lang): void {
  if (typeof window === 'undefined') return;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}

/** Read persisted values from localStorage (SSR-safe) */
function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  return (localStorage.getItem('lang') as Lang) ?? 'en';
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('theme') as Theme) ?? 'dark';
}

export const useUIStore = create<UIState>()((set) => {
  const initialLang = getInitialLang();
  const initialTheme = getInitialTheme();

  // Apply initial DOM state
  if (typeof window !== 'undefined') {
    applyLangToDom(initialLang);
    applyThemeToDom(initialTheme);

    // Listen for system theme changes when theme === 'system'
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const current = (localStorage.getItem('theme') as Theme) ?? 'dark';
      if (current === 'system') {
        applyThemeToDom('system');
      }
    });
  }

  return {
    lang: initialLang,
    theme: initialTheme,
    activeScreen: '',

    setLang: (lang) => {
      localStorage.setItem('lang', lang);
      applyLangToDom(lang);
      set({ lang });
    },

    setTheme: (theme) => {
      localStorage.setItem('theme', theme);
      applyThemeToDom(theme);
      set({ theme });
    },

    setActiveScreen: (activeScreen) => {
      set((state) => {
        if (state.activeScreen === activeScreen) {
          return state;
        }
        return { activeScreen };
      });
    },
  };
});
