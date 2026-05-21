'use client';

import React from 'react';
import { Lock } from 'lucide-react';

interface OtpAuthProps {
  otpStep: 'none' | 'email' | 'code' | 'verified';
  lookupEmail: string;
  setLookupEmail: (val: string) => void;
  lookupOtp: string;
  setLookupOtp: (val: string) => void;
  handleOtpRequest: (e: React.FormEvent) => void;
  handleVerifyOtp: (e: React.FormEvent) => void;
  otpError: string | null;
  setOtpError: (val: string | null) => void;
}

export function OtpAuth({
  otpStep,
  lookupEmail,
  setLookupEmail,
  lookupOtp,
  setLookupOtp,
  handleOtpRequest,
  handleVerifyOtp,
  otpError,
  setOtpError
}: OtpAuthProps) {
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase font-mono">
        <Lock className="w-5 h-5" />
        <span>Secure Order Verification (OTP)</span>
      </div>

      {otpError && (
        <div className="p-3 bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl text-[10px] font-bold" role="alert">
          {otpError}
        </div>
      )}

      {otpStep === 'none' || otpStep === 'email' ? (
        <form onSubmit={handleOtpRequest} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <p className="text-[11px] text-slate-450 dark:text-slate-400 font-normal">
            Please input your registered account email to dispatch a 4-digit code.
          </p>
          <div>
            <label className="block text-slate-450 dark:text-slate-400 mb-1.5">Corporate Email</label>
            <input
              type="email"
              required
              placeholder="david.miller@yahoo.com"
              value={lookupEmail}
              onChange={(e) => {
                setLookupEmail(e.target.value);
                setOtpError(null);
              }}
              className="w-full px-3.5 py-2 border border-slate-250 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-550 text-slate-800 dark:text-white"
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer">
            Send Verification Code
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <p className="text-[11px] text-slate-450 dark:text-slate-400 font-normal">
            We sent a verification code to {lookupEmail}. Enter the code below (use code 1234).
          </p>
          <div>
            <label className="block text-slate-450 dark:text-slate-400 mb-1.5">Verification Code</label>
            <input
              type="text"
              required
              maxLength={4}
              placeholder="e.g. 1234"
              value={lookupOtp}
              onChange={(e) => {
                setLookupOtp(e.target.value);
                setOtpError(null);
              }}
              className="w-full px-3.5 py-2 border border-slate-250 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-550 font-mono text-center text-lg tracking-widest text-slate-800 dark:text-white"
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer">
            Verify Code
          </button>
        </form>
      )}
    </div>
  );
}
