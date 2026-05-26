import type { UserRole } from '@/types';

export type RegisterLanguage = 'en' | 'ar';

export interface RegisterFormValues {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  preferredLanguage: RegisterLanguage;
  country: string;
  acceptTerms: boolean;
}

export interface RegisterValidationMessages {
  fullNameRequired: string;
  fullNameMin: string;
  emailRequired: string;
  emailInvalid: string;
  mobileRequired: string;
  mobileInvalid: string;
  passwordRequired: string;
  passwordMin: string;
  passwordUppercase: string;
  passwordLowercase: string;
  passwordNumber: string;
  passwordSpecial: string;
  confirmPasswordRequired: string;
  confirmPasswordMismatch: string;
  termsRequired: string;
  otpRequired: string;
  otpInvalid: string;
}

export interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  mobile?: string;
  password?: string;
  confirmPassword?: string;
  preferredLanguage?: string;
  country?: string;
  acceptTerms?: string;
  otp?: string;
}

export interface RegisterDraft extends RegisterFormValues {
  accountId: string;
  submittedAt: string;
  customerRole: Extract<UserRole, 'customer'>;
}

export interface RegisterOtpSession {
  accountId: string;
  fullName: string;
  email: string;
  mobile: string;
  preferredLanguage: RegisterLanguage;
  country: string;
  customerRole: Extract<UserRole, 'customer'>;
  createdAt: string;
  resendAvailableAt: string;
  attempts: number;
  flashMessage: 'sent' | 'resent' | null;
}

export interface RegisterSuccessState {
  accountId: string;
  fullName: string;
  email: string;
  customerRole: Extract<UserRole, 'customer'>;
  completedAt: string;
}

export interface ToastMessage {
  id: string;
  tone: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export interface CountryOption {
  value: string;
  dialingCode: string;
  labelEn: string;
  labelAr: string;
}

export interface LanguageOption {
  value: RegisterLanguage;
  labelEn: string;
  labelAr: string;
}