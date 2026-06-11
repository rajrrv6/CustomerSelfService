import React from 'react';
import { 
  Paperclip, Globe, Mic, Volume2, VolumeX, Send, CheckCircle 
} from 'lucide-react';
import { ChatComposerProps } from './types';
import { ANIMATION_TRANSITIONS } from './constants';

export function ChatComposer({
  isRtl,
  chatInput,
  setChatInput,
  isStreaming,
  isTtsEnabled,
  setIsTtsEnabled,
  handleSendMessage,
  handleComposerKeyDown,
  fileInputRef,
  textareaRef,
  handleFileAttach,
  showUrlInput,
  setShowUrlInput,
  urlInput,
  setUrlInput,
  handleUrlAttach,
  attachedFiles,
  setAttachedFiles,
  attachedUrls,
  setAttachedUrls,
  showSlashMenu,
  filteredCommands,
  slashMenuIndex,
  handleSlashSelect,
  setIsVoiceActive,
  isVoiceActive
}: ChatComposerProps) {
  return (
    <>
      {/* Dynamic attachments preview bar */}
      {(attachedFiles.length > 0 || attachedUrls.length > 0) && (
        <div className={`px-5 py-2.5 bg-slate-100/80 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap gap-2 items-center shrink-0 ${ANIMATION_TRANSITIONS}`}>
          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">{isRtl ? 'سياق إضافي:' : 'Attached Context:'}</span>
          
          {attachedFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-semibold">
              <Paperclip className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[120px]">{f.name}</span>
              {f.progress < 100 ? (
                <span className="text-blue-500 font-mono text-[8px] animate-pulse">({f.progress}%)</span>
              ) : (
                <CheckCircle className="w-3 h-3 text-emerald-500" />
              )}
              <button onClick={() => setAttachedFiles(prev => prev.filter(file => file.name !== f.name))} className="text-slate-400 hover:text-rose-500 cursor-pointer">×</button>
            </div>
          ))}

          {attachedUrls.map((url, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-955 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-semibold">
              <Globe className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[120px]">{url}</span>
              <button onClick={() => setAttachedUrls(prev => prev.filter(u => u !== url))} className="text-slate-400 hover:text-rose-500 cursor-pointer">×</button>
            </div>
          ))}
        </div>
      )}

      {/* Autocomplete slash suggestions menu */}
      {showSlashMenu && filteredCommands.length > 0 && (
        <div className="mx-5 mb-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl z-10 animate-in slide-in-from-bottom-2 duration-150 text-xs font-semibold">
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            {isRtl ? 'أوامر سياق الذكاء' : 'Select AI command shortcut'}
          </div>
          {filteredCommands.map((item, idx) => {
            const isSelected = slashMenuIndex === idx;
            return (
              <button
                key={item.cmd}
                onClick={() => handleSlashSelect(item.cmd)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors cursor-pointer focus:outline-none ${
                  isSelected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-500/10 text-slate-700 dark:text-slate-300'
                }`}
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm shrink-0">{item.icon}</span>
                  <span className={`font-mono font-bold ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>{item.cmd}</span>
                </div>
                <span className={`text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.label} • {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Composer Input Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex gap-2.5 items-end">
          
          {/* Attachment connectors */}
          <div className="flex gap-1 shrink-0 pb-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-slate-500 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
              title={isRtl ? 'إرفاق ملف' : 'Attach file'}
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input 
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileAttach}
            />

            <button
              onClick={() => setShowUrlInput(!showUrlInput)}
              className={`p-2.5 border rounded-xl cursor-pointer transition-colors shrink-0 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                showUrlInput ? 'border-blue-500 bg-blue-500/5 text-blue-500' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
              }`}
              title={isRtl ? 'إرفاق رابط ويب' : 'Attach URL link'}
            >
              <Globe className="w-4 h-4" />
            </button>
          </div>

          {/* Composer Input field */}
          <div className="flex-1 relative min-w-0">
            <textarea
              ref={textareaRef}
              placeholder={isRtl ? "اسأل سؤالاً أو اكتب '/' للأوامر..." : "Ask a query or type '/' for commands..."}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              rows={1}
              className={`w-full ${isRtl ? 'pr-4 pl-12' : 'pl-4 pr-12'} py-3 border border-slate-200 dark:border-slate-800 bg-transparent rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 text-xs font-medium text-slate-800 dark:text-white resize-none max-h-32 leading-relaxed`}
              style={{ direction: isRtl ? 'rtl' : 'ltr' }}
            />

            {/* Voice micro inputs */}
            <button
              onClick={() => setIsVoiceActive(true)}
              className={`absolute ${isRtl ? 'left-3.5' : 'right-3.5'} bottom-3.5 p-1 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isStreaming ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-slate-405 text-slate-400 hover:text-slate-600'
              } ${isVoiceActive ? 'text-rose-500 bg-rose-500/10 animate-pulse' : ''}`}
              disabled={isStreaming}
              title={isRtl ? 'تصفح الإدخال الصوتي' : 'Push-to-talk microphone'}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Voice TTS speaker output config */}
          <button
            onClick={() => setIsTtsEnabled(!isTtsEnabled)}
            className={`p-3 border rounded-2xl cursor-pointer transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
              isTtsEnabled ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500' : 'border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
            title={isTtsEnabled ? (isRtl ? 'كتم قراءة الصوت' : 'Mute voice read-out') : (isRtl ? 'تشغيل قراءة الصوت' : 'Enable voice read-out')}
          >
            {isTtsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Submit CTA */}
          <button
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || isStreaming}
            aria-label="Send message"
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl cursor-pointer transition-all active:scale-95 shadow-md shadow-blue-500/10 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* URL inputs form */}
        {showUrlInput && (
          <form onSubmit={handleUrlAttach} className="mt-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex gap-2 items-center animate-in slide-in-from-bottom-2 duration-150">
            <Globe className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="url"
              required
              placeholder="https://docs.enterprise.com/pricing"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-transparent outline-none border-none text-[11px] focus:ring-0 text-slate-800 dark:text-white"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] cursor-pointer focus:ring-2 focus:ring-blue-500"
            >
              {isRtl ? 'إضافة' : 'Attach'}
            </button>
            <button
              type="button"
              onClick={() => { setShowUrlInput(false); setUrlInput(''); }}
              className="p-1.5 text-slate-400 hover:text-slate-600 text-[10px] cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
