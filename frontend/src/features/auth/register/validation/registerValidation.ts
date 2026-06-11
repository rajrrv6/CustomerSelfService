import type { RegisterFormErrors, RegisterFormValues, RegisterValidationMessages } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGITS_ONLY_REGEX = /^\d+$/;

export function validateRegisterForm(
  values: RegisterFormValues,
  messages: RegisterValidationMessages
): { valid: boolean; errors: RegisterFormErrors } {
  const errors: RegisterFormErrors = {};
  const trimmedName = values.fullName.trim();
  const trimmedEmail = values.email.trim();
  const trimmedMobile = values.mobile.trim();
  const password = values.password;

  if (!trimmedName) {
    errors.fullName = messages.fullNameRequired;
  } else if (trimmedName.length < 3) {
    errors.fullName = messages.fullNameMin;
  }

  if (!trimmedEmail) {
    errors.email = messages.emailRequired;
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = messages.emailInvalid;
  }

  if (!trimmedMobile) {
    errors.mobile = messages.mobileRequired;
  } else if (!DIGITS_ONLY_REGEX.test(trimmedMobile)) {
    errors.mobile = messages.mobileInvalid;
  }

  if (!password) {
    errors.password = messages.passwordRequired;
  } else if (password.length < 8) {
    errors.password = messages.passwordMin;
  } else if (!/[A-Z]/.test(password)) {
    errors.password = messages.passwordUppercase;
  } else if (!/[a-z]/.test(password)) {
    errors.password = messages.passwordLowercase;
  } else if (!/\d/.test(password)) {
    errors.password = messages.passwordNumber;
  } else if (!/[^A-Za-z0-9]/.test(password)) {
    errors.password = messages.passwordSpecial;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = messages.confirmPasswordRequired;
  } else if (values.confirmPassword !== password) {
    errors.confirmPassword = messages.confirmPasswordMismatch;
  }

  if (!values.acceptTerms) {
    errors.acceptTerms = messages.termsRequired;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateOtpCode(code: string, messages: RegisterValidationMessages) {
  if (!code.trim()) {
    return { valid: false, error: messages.otpRequired };
  }

  if (!/^\d{6}$/.test(code)) {
    return { valid: false, error: messages.otpInvalid };
  }

  return { valid: true };
}