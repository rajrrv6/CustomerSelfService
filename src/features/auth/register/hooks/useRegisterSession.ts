import { useCallback, useMemo, useState } from 'react';
import type { RegisterDraft, RegisterFormValues, RegisterOtpSession, RegisterSuccessState } from '../types';
import {
  buildOtpSession,
  buildSuccessState,
  clearOtpSession,
  clearRegisterDraft,
  clearRegisterSuccess,
  persistOtpSession,
  persistRegisterDraft,
  persistRegisterSuccess,
  readOtpSession,
  readRegisterDraft,
  readRegisterSuccess,
} from '../mock/session';
import {
  REGISTER_MOCK_API_DELAY_MS,
  REGISTER_MOCK_OTP,
  REGISTER_MOCK_OTP_VERIFY_DELAY_MS,
  REGISTER_MOCK_RESEND_DELAY_MS,
  REGISTER_RESEND_COOLDOWN_SECONDS,
} from '../mock/constants';
import { createSession, persistRegisteredRole, persistSession } from '@/lib/auth/authStorage';

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function useRegisterSession() {
  const [draft, setDraft] = useState<RegisterDraft | null>(() => readRegisterDraft());
  const [otpSession, setOtpSession] = useState<RegisterOtpSession | null>(() => readOtpSession());
  const [successState, setSuccessState] = useState<RegisterSuccessState | null>(() => readRegisterSuccess());

  const submitRegistration = useCallback(async (values: RegisterFormValues) => {
    await delay(REGISTER_MOCK_API_DELAY_MS);

    const nextDraft = persistRegisterDraft(values);
    const session = buildOtpSession(nextDraft, 'sent');

    clearRegisterSuccess();
    persistOtpSession(session);
    setDraft(nextDraft);
    setOtpSession(session);
    setSuccessState(null);

    return {
      success: true as const,
      accountId: nextDraft.accountId,
    };
  }, []);

  const resendOtp = useCallback(async () => {
    if (!otpSession) {
      return { success: false as const, error: 'No active verification session.' };
    }

    await delay(REGISTER_MOCK_RESEND_DELAY_MS);

    const updated = {
      ...otpSession,
      resendAvailableAt: new Date(Date.now() + REGISTER_RESEND_COOLDOWN_SECONDS * 1000).toISOString(),
      flashMessage: 'resent' as const,
    };

    persistOtpSession(updated);
    setOtpSession(updated);

    return { success: true as const };
  }, [otpSession]);

  const verifyOtp = useCallback(
    async (code: string) => {
      if (!otpSession) {
        return { success: false as const, error: 'No active verification session.' };
      }

      await delay(REGISTER_MOCK_OTP_VERIFY_DELAY_MS);

      if (code !== REGISTER_MOCK_OTP) {
        const nextSession = { ...otpSession, attempts: otpSession.attempts + 1, flashMessage: null };
        persistOtpSession(nextSession);
        setOtpSession(nextSession);
        return { success: false as const, error: 'Invalid OTP.' };
      }

      const completedDraft = draft ?? readRegisterDraft();
      if (!completedDraft) {
        return { success: false as const, error: 'Missing registration draft.' };
      }

      persistRegisteredRole(completedDraft.email, completedDraft.customerRole);
      persistSession(createSession(completedDraft.email, completedDraft.customerRole, completedDraft.fullName));

      const nextSuccess = buildSuccessState(completedDraft);
      persistRegisterSuccess(nextSuccess);
      clearRegisterDraft();
      clearOtpSession();
      setDraft(null);
      setOtpSession(null);
      setSuccessState(nextSuccess);

      return { success: true as const };
    },
    [draft, otpSession]
  );

  const clearFlow = useCallback(() => {
    clearRegisterDraft();
    clearOtpSession();
    clearRegisterSuccess();
    setDraft(null);
    setOtpSession(null);
    setSuccessState(null);
  }, []);

  const acknowledgeOtpFlash = useCallback(() => {
    if (!otpSession) return;

    const nextSession = { ...otpSession, flashMessage: null };
    persistOtpSession(nextSession);
    setOtpSession(nextSession);
  }, [otpSession]);

  return useMemo(
    () => ({
      draft,
      otpSession,
      successState,
      submitRegistration,
      verifyOtp,
      resendOtp,
      clearFlow,
      acknowledgeOtpFlash,
    }),
    [draft, otpSession, successState, submitRegistration, verifyOtp, resendOtp, clearFlow, acknowledgeOtpFlash]
  );
}