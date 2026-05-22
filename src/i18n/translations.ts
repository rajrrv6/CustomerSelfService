import { en } from './en';
import { ar } from './ar';

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

export type TranslationKeys = DeepStringify<typeof en>;

export const translations: Record<'en' | 'ar', TranslationKeys> = {
  en,
  ar,
};

