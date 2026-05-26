import type {
  RegisterDraft,
  RegisterFormValues,
  RegisterOtpSession,
  RegisterSuccessState,
} from '../types';

const REGISTER_DRAFT_KEY = 'mpaas_register_draft';
const REGISTER_OTP_KEY = 'mpaas_register_otp_session';
const REGISTER_SUCCESS_KEY = 'mpaas_register_success';

function createAccountId() {
  return `reg-${Math.random().toString(36).slice(2, 10)}`;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  return safeParse<T>(window.localStorage.getItem(key));
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function removeStorage(key: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

export function readRegisterDraft(): RegisterDraft | null {
  return readStorage<RegisterDraft>(REGISTER_DRAFT_KEY);
}

export function persistRegisterDraft(values: RegisterFormValues): RegisterDraft {
  const draft: RegisterDraft = {
    ...values,
    accountId: createAccountId(),
    submittedAt: new Date().toISOString(),
    customerRole: 'customer',
  };

  writeStorage(REGISTER_DRAFT_KEY, draft);
  return draft;
}

export function clearRegisterDraft() {
  removeStorage(REGISTER_DRAFT_KEY);
}

export function readOtpSession(): RegisterOtpSession | null {
  return readStorage<RegisterOtpSession>(REGISTER_OTP_KEY);
}

export function persistOtpSession(session: RegisterOtpSession) {
  writeStorage(REGISTER_OTP_KEY, session);
}

export function clearOtpSession() {
  removeStorage(REGISTER_OTP_KEY);
}

export function readRegisterSuccess(): RegisterSuccessState | null {
  return readStorage<RegisterSuccessState>(REGISTER_SUCCESS_KEY);
}

export function persistRegisterSuccess(state: RegisterSuccessState) {
  writeStorage(REGISTER_SUCCESS_KEY, state);
}

export function clearRegisterSuccess() {
  removeStorage(REGISTER_SUCCESS_KEY);
}

export function buildOtpSession(draft: RegisterDraft, flashMessage: RegisterOtpSession['flashMessage']) {
  const now = new Date();
  const resendAvailableAt = new Date(now);
  resendAvailableAt.setSeconds(resendAvailableAt.getSeconds() + 30);

  return {
    accountId: draft.accountId,
    fullName: draft.fullName,
    email: draft.email,
    mobile: draft.mobile,
    preferredLanguage: draft.preferredLanguage,
    country: draft.country,
    customerRole: draft.customerRole,
    createdAt: now.toISOString(),
    resendAvailableAt: resendAvailableAt.toISOString(),
    attempts: 0,
    flashMessage,
  } satisfies RegisterOtpSession;
}

export function buildSuccessState(draft: RegisterDraft): RegisterSuccessState {
  return {
    accountId: draft.accountId,
    fullName: draft.fullName,
    email: draft.email,
    customerRole: draft.customerRole,
    completedAt: new Date().toISOString(),
  };
}