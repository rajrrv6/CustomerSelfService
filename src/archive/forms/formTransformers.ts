/**
 * Form Transformers
 * Helper mapping functions between domain data objects and form-friendly structures.
 */

export const formTransformers = {
  /**
   * Split a comma-separated list of values into a clean trimmed string array.
   */
  stringToTagArray(raw: string | undefined): string[] {
    if (!raw) return [];
    return raw
      .split(/[\n,;]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  },

  /**
   * Join an array of strings into a comma-separated single line.
   */
  tagArrayToString(tags: string[] | undefined): string {
    if (!tags || !Array.isArray(tags)) return '';
    return tags.join(', ');
  },

  /**
   * Format numbers to clean float bounds.
   */
  coerceNumber(val: any, fallback = 0): number {
    const num = Number(val);
    return isNaN(num) ? fallback : num;
  },

  /**
   * Parse a JSON string safely, returning undefined on invalid inputs.
   */
  safeJsonParse<T>(raw: string): T | undefined {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  },

  /**
   * Stringify JSON safely for a text area, adding standard indentation.
   */
  safeJsonStringify(obj: any): string {
    if (obj === undefined || obj === null) return '';
    if (typeof obj === 'string') return obj;
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return '';
    }
  }
};
