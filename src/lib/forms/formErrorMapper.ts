import { FieldError } from 'react-hook-form';

export function getErrorMessage(error: FieldError | undefined, lang: 'en' | 'ar'): string | undefined {
  if (!error) return undefined;
  if (error.message) return error.message;

  if (lang === 'ar') {
    switch (error.type) {
      case 'required':
        return 'هذا الحقل مطلوب';
      case 'invalid_string':
        return 'صيغة البيانات المدخلة غير صالحة';
      case 'too_small':
        return 'القيمة المدخلة قصيرة جداً أو أقل من الحد الأدنى';
      case 'too_big':
        return 'القيمة المدخلة طويلة جداً أو تتجاوز الحد الأقصى';
      default:
        return 'قيمة غير صالحة';
    }
  }

  switch (error.type) {
    case 'required':
      return 'This field is required';
    case 'invalid_string':
      return 'Invalid format provided';
    case 'too_small':
      return 'Value is too short or below the minimum limit';
    case 'too_big':
      return 'Value is too long or exceeds the maximum limit';
    default:
      return 'Invalid value';
  }
}
