'use client';

import React from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { OtpAuth } from './OtpAuth';

interface RefundWizardProps {
  setActiveSubScreen: (sub: string) => void;
  otpStep: 'none' | 'email' | 'code' | 'verified';
  setOtpStep: (val: 'none' | 'email' | 'code' | 'verified') => void;
  lookupEmail: string;
  setLookupEmail: (val: string) => void;
  lookupOtp: string;
  setLookupOtp: (val: string) => void;
  lookupOrderNum: string;
  refundStep: 'none' | 'select' | 'confirm' | 'submitting' | 'done';
  setRefundStep: (val: 'none' | 'select' | 'confirm' | 'submitting' | 'done') => void;
  refundReason: string;
  setRefundReason: (val: string) => void;
  refundAttachment: string;
  setRefundAttachment: (val: string) => void;
  handleOtpRequest: (e: React.FormEvent) => void;
  handleVerifyOtp: (e: React.FormEvent) => void;
  otpError: string | null;
  setOtpError: (val: string | null) => void;
}

export function RefundWizard({
  setActiveSubScreen,
  otpStep,
  setOtpStep,
  lookupEmail,
  setLookupEmail,
  lookupOtp,
  setLookupOtp,
  lookupOrderNum,
  refundStep,
  setRefundStep,
  refundReason,
  setRefundReason,
  refundAttachment,
  setRefundAttachment,
  handleOtpRequest,
  handleVerifyOtp,
  otpError,
  setOtpError
}: RefundWizardProps) {
  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveSubScreen('customer_home')}
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold">Order Lookup & Return Portal</h2>
          <p className="text-xs text-slate-400">Validate orders and process refund exceptions.</p>
        </div>
      </div>

      {otpStep !== 'verified' ? (
        <OtpAuth
          otpStep={otpStep}
          lookupEmail={lookupEmail}
          setLookupEmail={setLookupEmail}
          lookupOtp={lookupOtp}
          setLookupOtp={setLookupOtp}
          handleOtpRequest={handleOtpRequest}
          handleVerifyOtp={handleVerifyOtp}
          otpError={otpError}
          setOtpError={setOtpError}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Verified Order status timeline & Return selector */}
          <div className="lg:col-span-2 space-y-4">
            {/* Order Specifications */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">Order ID</span>
                  <h4 className="font-bold text-sm text-slate-850 dark:text-white font-mono">{lookupOrderNum}</h4>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-[10px] font-bold">
                  REFUND ELIGIBLE (within 30d)
                </span>
              </div>

              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-455">Item Name</span>
                  <span>SaaS Gold Subscription renewal pack</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Purchased amount</span>
                  <span className="font-bold font-mono text-blue-600 dark:text-blue-400">$49.99 USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Date of Shipment</span>
                  <span className="font-mono">2026-05-10</span>
                </div>
              </div>
            </div>

            {/* Return Wizard step */}
            {refundStep === 'none' ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-center py-8 space-y-3">
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-350">Need to return this item?</h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-400 max-w-sm mx-auto font-normal leading-relaxed">
                  Start the automated return process. Once submitted, your gold account credits will update within 3 business days.
                </p>
                <button
                  onClick={() => setRefundStep('select')}
                  className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                >
                  Initiate Return/Refund
                </button>
              </div>
            ) : refundStep === 'select' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setRefundStep('confirm');
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-xs font-semibold"
              >
                <h4 className="font-bold text-xs text-slate-850 dark:text-white uppercase font-mono">Return Details</h4>
                <div>
                  <label className="block text-slate-450 dark:text-slate-400 mb-1.5">Reason for return</label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-350 dark:bg-slate-900"
                  >
                    <option>Damaged on Arrival</option>
                    <option>SLA Metrics breached</option>
                    <option>Incorrect package size</option>
                    <option>Duplicate billing instance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-450 dark:text-slate-400 mb-1.5">Upload Attachment logs</label>
                  <input
                    type="text"
                    placeholder="e.g. log_downtime_error.txt"
                    value={refundAttachment}
                    onChange={(e) => setRefundAttachment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setRefundStep('none')}
                    className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer">
                    Submit Return Details
                  </button>
                </div>
              </form>
            ) : refundStep === 'confirm' ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-xs font-semibold">
                <h4 className="font-bold text-xs text-slate-850 dark:text-white uppercase font-mono">Confirm Return Exemption</h4>
                <p className="text-[11px] text-slate-455 dark:text-slate-400 font-normal">
                  Please review your return parameters below before dispatching the sync triggers to the SAP exemption gateway.
                </p>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order ID:</span>
                    <span className="font-mono font-bold">{lookupOrderNum}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Item:</span>
                    <span>SaaS Gold Subscription renewal pack</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Return Reason:</span>
                    <span className="font-bold">{refundReason}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Uploaded Logs:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{refundAttachment || 'No logs uploaded (Standard check rules)'}</span>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setRefundStep('select')}
                    className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Edit details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRefundStep('submitting');
                      setTimeout(() => {
                        setRefundStep('done');
                      }, 1800);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md"
                  >
                    Confirm & Submit Refund
                  </button>
                </div>
              </div>
            ) : refundStep === 'submitting' ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm text-center space-y-4 py-12">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-1.5">
                  <h4 className="font-bold text-xs text-slate-850 dark:text-white uppercase font-mono animate-pulse">Running SAP Exemption Sync...</h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 font-normal">
                    Evaluating SLA performance metrics against Pinecone search indices...
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-center space-y-3.5 py-10">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-850 dark:text-white">Refund Request Logged</h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Exemption requested successfully under reason &apos;{refundReason}&apos;. Your account credentials have been logged for processing.
                </p>
                <button
                  onClick={() => setRefundStep('none')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Close Wizard
                </button>
              </div>
            )}
          </div>

          {/* Right panel: Order Logistics Milestones timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 h-fit">
            <h4 className="font-bold text-xs text-slate-450 uppercase font-mono">Logistic Milestones (SAP Sync)</h4>
            <div className="space-y-4">
              <div className="flex gap-3 border-l border-emerald-500 pb-3 pl-3 relative">
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center border border-white dark:border-slate-900" />
                <div className="text-[11px] font-semibold">
                  <h5 className="font-bold text-slate-850 dark:text-white">1. Order Placed</h5>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 font-normal">Approved & registered in Dubai-Core ERP.</p>
                  <span className="text-[9px] text-slate-400 font-mono">May 10, 08:30 AST</span>
                </div>
              </div>
              <div className="flex gap-3 border-l border-emerald-500 pb-3 pl-3 relative">
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center border border-white dark:border-slate-900" />
                <div className="text-[11px] font-semibold">
                  <h5 className="font-bold text-slate-850 dark:text-white">2. Performance SLA Verified</h5>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 font-normal">Exemption check rules validated.</p>
                  <span className="text-[9px] text-slate-400 font-mono">May 10, 10:15 AST</span>
                </div>
              </div>
              <div className="flex gap-3 border-l border-emerald-500 pb-3 pl-3 relative">
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center border border-white dark:border-slate-900" />
                <div className="text-[11px] font-semibold">
                  <h5 className="font-bold text-slate-850 dark:text-white">3. Dispatched & Synced</h5>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 font-normal">Synced tracking ID to customer portal.</p>
                  <span className="text-[9px] text-slate-400 font-mono">May 10, 14:00 AST</span>
                </div>
              </div>
              <div className="flex gap-3 pl-3 relative">
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center border border-white dark:border-slate-900" />
                <div className="text-[11px] font-semibold">
                  <h5 className="font-bold text-slate-850 dark:text-white">4. Delivered & Signed</h5>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 font-normal">Signed off by customer D. Miller.</p>
                  <span className="text-[9px] text-slate-400 font-mono">May 10, 16:45 AST</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
