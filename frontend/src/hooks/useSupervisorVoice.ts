import { useState, useCallback } from 'react';

export type SupervisorVoiceMode = 'none' | 'silent' | 'whisper' | 'barge';

export function useSupervisorVoice() {
  const [mode, setMode] = useState<SupervisorVoiceMode>('none');
  const [whisperHint, setWhisperHint] = useState<string | null>(null);

  const silentMonitor = useCallback(() => {
    setMode('silent');
    setWhisperHint(null);
  }, []);

  const whisperCoach = useCallback((hint: string) => {
    setMode('whisper');
    setWhisperHint(hint);
  }, []);

  const bargeIn = useCallback(() => {
    setMode('barge');
    setWhisperHint(null);
  }, []);

  const stopMonitoring = useCallback(() => {
    setMode('none');
    setWhisperHint(null);
  }, []);

  return {
    mode,
    whisperHint,
    silentMonitor,
    whisperCoach,
    bargeIn,
    stopMonitoring,
    setMode,
    setWhisperHint
  };
}
