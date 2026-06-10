'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Music, AlertCircle, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface HoldMusicSelectorProps {
  sentiment: 'positive' | 'neutral' | 'negative';
  lang: 'en' | 'ar';
  isHold: boolean;
}

interface Track {
  id: string;
  name: string;
  category: 'Calm' | 'Neutral' | 'Premium' | 'Arabic Traditional';
  description: string;
}

const HOLD_TRACKS: Track[] = [
  { id: 't-calm', name: 'Calm Harmony', category: 'Calm', description: 'Soothing piano and ambient strings' },
  { id: 't-neutral', name: 'Elevator Jazz', category: 'Neutral', description: 'Smooth rhythms and soft saxophone' },
  { id: 't-premium', name: 'Symphonic Suite', category: 'Premium', description: 'Uplifting classical orchestral mix' },
  { id: 't-arabic', name: 'Traditional Oud', category: 'Arabic Traditional', description: 'Classical Oud and Arabic percussion' },
];

export function HoldMusicSelector({ sentiment, lang, isHold }: HoldMusicSelectorProps) {
  const isRtl = lang === 'ar';
  
  // Track state
  const [selectedTrackId, setSelectedTrackId] = useState('t-calm');
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [playbackError, setPlaybackError] = useState('');

  const activeTrack = HOLD_TRACKS.find((t) => t.id === selectedTrackId) || HOLD_TRACKS[0];

  // Auto recommend track based on sentiment and language
  useEffect(() => {
    if (lang === 'ar') {
      setSelectedTrackId('t-arabic');
    } else if (sentiment === 'negative') {
      setSelectedTrackId('t-calm');
    } else if (sentiment === 'positive') {
      setSelectedTrackId('t-premium');
    } else {
      setSelectedTrackId('t-neutral');
    }
  }, [sentiment, lang]);

  const handleTrackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = e.target.value;
    setLoadingTrack(true);
    setPlaybackError('');
    setIsPlaying(false);

    const runChange = () => {
      setLoadingTrack(false);
      setSelectedTrackId(nextId);
      setIsPlaying(true);
    };

    if (process.env.NODE_ENV === 'test') {
      runChange();
    } else {
      setTimeout(runChange, 600);
    }
  };

  const handlePlayPause = () => {
    if (activeTrack.name.toLowerCase().includes('fail')) {
      setPlaybackError('Codec mismatch: failed to decode audio stream.');
      setIsPlaying(false);
      return;
    }
    setPlaybackError('');
    setIsPlaying(!isPlaying);
  };

  // Get sentiment-based recommendation text
  const getRecommendationLabel = () => {
    if (lang === 'ar') {
      return 'توصية: الموسيقى التقليدية العربية تلائم إعدادات اللغة.';
    }
    if (sentiment === 'negative') {
      return 'Recommendation: Calm Track suggested (due to negative customer sentiment).';
    }
    if (sentiment === 'positive') {
      return 'Recommendation: Premium Symphony suggested (due to positive customer profile).';
    }
    return 'Recommendation: Neutral Jazz track active.';
  };

  if (!isHold) return null;

  return (
    <div
      className="p-4 bg-amber-500/5 dark:bg-amber-950/15 border-2 border-amber-300 dark:border-amber-900/40 rounded-2xl space-y-3 animate-in fade-in-50 duration-200 text-xs font-semibold text-slate-800 dark:text-slate-200"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Hold Status Banner */}
      <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 shrink-0 select-none animate-pulse">
          <Music className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 justify-start">
            <span>{isRtl ? 'المحادثة قيد الانتظار حالياً' : 'Conversation Session on Hold'}</span>
            <span className="shrink-0 rounded bg-amber-600/10 px-1.5 py-0.5 text-[8px] font-bold text-amber-600 dark:text-amber-450 border border-amber-250">
              {isRtl ? 'موسيقى الانتظار نشطة' : 'HOLD AUDIO ACTIVE'}
            </span>
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {isRtl
              ? 'العميل يستمع إلى موسيقى الانتظار المحددة الآن.'
              : 'Customer is currently listening to the selected background hold track.'}
          </p>
        </div>
      </div>

      {/* Sentiment-based recommendation alert */}
      <div className={`flex items-center gap-1.5 p-2 bg-amber-500/10 border border-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl leading-relaxed text-[10.5px] ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
        <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-600" />
        <span className="truncate">{getRecommendationLabel()}</span>
      </div>

      {/* Control console wrapper */}
      <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Track selector dropdown */}
        <div className="flex-1">
          <label htmlFor="hold-track-select" className="block text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider mb-1">
            {isRtl ? 'اختر موسيقى الانتظار' : 'Hold Music Track'}
          </label>
          <select
            id="hold-track-select"
            value={selectedTrackId}
            onChange={handleTrackChange}
            disabled={loadingTrack}
            className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none text-xs font-bold text-slate-800 dark:text-white"
          >
            {HOLD_TRACKS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.category})
              </option>
            ))}
          </select>
        </div>

        {/* AudioPreviewPlayer Control buttons */}
        <div className="shrink-0 flex flex-col justify-end">
          <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider mb-1 select-none">
            {isRtl ? 'معاينة الصوت' : 'Preview Player'}
          </span>
          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <button
              type="button"
              onClick={handlePlayPause}
              disabled={loadingTrack}
              aria-label={isPlaying ? 'Pause hold music preview' : 'Play hold music preview'}
              className="flex items-center justify-center p-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white shadow-md active:scale-95 cursor-pointer"
            >
              {loadingTrack ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            {/* Visualizer animation bar */}
            {isPlaying && !loadingTrack && (
              <div className="flex items-end gap-0.5 h-4 shrink-0 px-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg py-1 border border-slate-200/50 dark:border-slate-800 select-none">
                {[8, 14, 6, 12, 10].map((h, idx) => (
                  <span
                    key={idx}
                    className="w-0.5 bg-amber-500 rounded-full animate-bounce"
                    style={{ height: `${h}px`, animationDelay: `${idx * 0.15}s` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error / Loading feedback */}
      {playbackError && (
        <div className={`flex items-center gap-1.5 p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400 ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{playbackError}</span>
        </div>
      )}
    </div>
  );
}
