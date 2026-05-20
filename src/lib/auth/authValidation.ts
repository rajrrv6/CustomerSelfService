import type {
  LoginCredentials,
  PasswordStrengthResult,
  ResetPasswordFormErrors,
  ValidationResult,
} from '@/types/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
/** Minimum length for password reset (stricter than login for mock enterprise policy) */
export const RESET_PASSWORD_MIN_LENGTH = 10;

export function validateLoginCredentials(
  credentials: LoginCredentials
): ValidationResult {
  const errors: ValidationResult['errors'] = {};
  const email = credentials.email.trim();
  const password = credentials.password;

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateMfaCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

export function validateForgotPasswordEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, error: 'Email is required.' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Enter a valid email address.' };
  }
  return { valid: true };
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;
  if (password.length >= RESET_PASSWORD_MIN_LENGTH) score += 1;
  if (password.length >= 14) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  score = Math.min(4, score);
  const level: PasswordStrengthResult['level'] =
    score <= 1 ? 'weak' : score === 2 ? 'fair' : score === 3 ? 'good' : 'strong';
  const percent = Math.min(100, (score / 4) * 100);

  return { level, score, percent };
}

export function validateResetPasswordForm(
  newPassword: string,
  confirmPassword: string
): { valid: boolean; errors: ResetPasswordFormErrors } {
  const errors: ResetPasswordFormErrors = {};

  if (!newPassword) {
    errors.newPassword = 'Password is required.';
  } else if (newPassword.length < RESET_PASSWORD_MIN_LENGTH) {
    errors.newPassword = `Use at least ${RESET_PASSWORD_MIN_LENGTH} characters.`;
  } else {
    const strength = evaluatePasswordStrength(newPassword);
    if (strength.score < 2) {
      errors.newPassword =
        'Choose a stronger password (mix upper & lower case, a number, and a symbol).';
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (confirmPassword !== newPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
