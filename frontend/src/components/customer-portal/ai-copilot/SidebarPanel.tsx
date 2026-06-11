import React from 'react';
import { 
  Plus, Search, Pin, PinOff, Edit2, Share2, Trash2, Check, X 
} from 'lucide-react';
import { SidebarPanelProps } from './types';
import { ANIMATION_TRANSITIONS } from './constants';

export const SidebarPanel = React.memo(function SidebarPanel({
  isRtl,
  conversations,
  activeConvId,
  setActiveConvId,
  searchQuery,
  setSearchQuery,
  editingConvId,
  setEditingConvId,
  editingTitle,
  setEditingTitle,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  handleNewConversation,
  handleDeleteConversation,
  handleTogglePin,
  saveRename,
  startRename,
  setShowShareModal,
  setShowPrivacyModal
}: SidebarPanelProps) {
  const filteredConvs = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConvs = filteredConvs.filter(c => c.pinned);
  const recentConvs = filteredConvs.filter(c => !c.pinned);

  return (
    <>
      {/* Mobile Sidebar Backdrop overlay */}
      {!isSidebarCollapsed && (
        <div 
          onClick={() => setIsSidebarCollapsed(true)}
          className="md:hidden absolute inset-0 bg-slate-900/50 backdrop-blur-xs z-25 animate-in fade-in duration-300 cursor-pointer"
        />
      )}

      {/* LEFT PANEL: Conversations Sidebar */}
      <div className={`bg-white dark:bg-[#0b0f19] flex flex-col justify-between shrink-0 z-30 absolute md:relative h-full ${ANIMATION_TRANSITIONS} ${
        isSidebarCollapsed 
          ? `${isRtl ? 'translate-x-full' : '-translate-x-full'} md:translate-x-0 md:w-0 md:opacity-0 md:border-r-0 overflow-hidden` 
          : 'translate-x-0 w-64 opacity-100'
      } ${
        isRtl 
          ? 'right-0 border-l border-slate-200 dark:border-slate-800' 
          : 'left-0 border-r border-slate-200 dark:border-slate-800'
      }`}>
        <div className="p-4 flex-1 flex flex-col min-h-0">
          
          {/* New Conversation Button */}
          <div className="flex gap-2">
            <button
              onClick={handleNewConversation}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-98 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'محادثة جديدة' : 'New Conversation'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(true)}
              className="md:hidden p-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              title={isRtl ? 'إغلاق القائمة' : 'Close Sidebar'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mt-3">
            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5 w-3.5 h-3.5 text-slate-400`} />
            <input
              type="text"
              placeholder={isRtl ? 'ابحث في العناوين...' : 'Search threads...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-1.5 ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-[11px] font-semibold text-slate-800 dark:text-white`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-2.5 text-slate-400 hover:text-slate-650 hover:text-slate-600`}>
                ×
              </button>
            )}
          </div>

          {/* Scrolled Thread Lists */}
          <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
            
            {/* Pinned Section */}
            {pinnedConvs.length > 0 && (
              <div className="space-y-1">
                <span className="text-[8.5px] uppercase font-bold text-slate-400 font-mono tracking-wider block mb-1.5 px-1">
                  📌 {isRtl ? 'المحادثات المثبتة' : 'Pinned'}
                </span>
                
                {pinnedConvs.map(c => {
                  const isActive = c.id === activeConvId;
                  const isEditing = c.id === editingConvId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => !isEditing && setActiveConvId(c.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all group cursor-pointer border ${
                        isActive 
                          ? 'bg-blue-500/5 border-blue-500/15 text-blue-600 dark:bg-blue-950/20' 
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-805 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400'
                      }`}
                      style={{ textAlign: isRtl ? 'right' : 'left' }}
                    >
                      {isEditing ? (
                        <form onSubmit={(e) => saveRename(c.id, e)} className="flex items-center gap-1.5 w-full">
                          <input 
                            type="text" 
                            value={editingTitle} 
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="bg-transparent border border-slate-300 dark:border-slate-700 outline-none rounded px-1.5 py-0.5 text-[10px] flex-1 text-slate-800 dark:text-white focus:ring-1 focus:ring-blue-500"
                          />
                          <button type="submit" className="text-emerald-500 hover:scale-110"><Check className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => setEditingConvId(null)} className="text-rose-500 hover:scale-110"><X className="w-3.5 h-3.5" /></button>
                        </form>
                      ) : (
                        <>
                          <span className="truncate pr-1 leading-tight flex-1">{c.title}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                            <button onClick={(e) => handleTogglePin(c.id, e)} className="p-0.5 hover:text-blue-500 hover:bg-blue-500/10 rounded focus:ring-1 focus:ring-blue-500 outline-none" title={isRtl ? 'إلغاء التثبيت' : 'Unpin'}><PinOff className="w-3 h-3" /></button>
                            <button onClick={(e) => startRename(c.id, c.title, e)} className="p-0.5 hover:text-blue-500 hover:bg-blue-500/10 rounded focus:ring-1 focus:ring-blue-500 outline-none" title={isRtl ? 'إعادة التسمية' : 'Rename'}><Edit2 className="w-3 h-3" /></button>
                            <button onClick={(e) => { e.stopPropagation(); setShowShareModal(c.id); }} className="p-0.5 hover:text-blue-500 hover:bg-blue-500/10 rounded focus:ring-1 focus:ring-blue-500 outline-none" title={isRtl ? 'مشاركة' : 'Share'}><Share2 className="w-3 h-3" /></button>
                            <button onClick={(e) => handleDeleteConversation(c.id, e)} className="p-0.5 hover:text-rose-500 hover:bg-rose-500/10 rounded focus:ring-1 focus:ring-rose-500 outline-none" title={isRtl ? 'حذف' : 'Delete'}><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recents Section */}
            <div className="space-y-1">
              <span className="text-[8.5px] uppercase font-bold text-slate-400 font-mono tracking-wider block mb-1.5 px-1">
                💬 {isRtl ? 'النشاط الأخير' : 'Recent Threads'}
              </span>

              {recentConvs.length === 0 && pinnedConvs.length === 0 ? (
                <span className="text-[10px] text-slate-400 block text-center py-4">{isRtl ? 'لا توجد محادثات' : 'No threads found'}</span>
              ) : (
                recentConvs.map(c => {
                  const isActive = c.id === activeConvId;
                  const isEditing = c.id === editingConvId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => !isEditing && setActiveConvId(c.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all group cursor-pointer border ${
                        isActive 
                          ? 'bg-blue-500/5 border-blue-500/15 text-blue-600 dark:bg-blue-950/20' 
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-805 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400'
                      }`}
                      style={{ textAlign: isRtl ? 'right' : 'left' }}
                    >
                      {isEditing ? (
                        <form onSubmit={(e) => saveRename(c.id, e)} className="flex items-center gap-1.5 w-full">
                          <input 
                            type="text" 
                            value={editingTitle} 
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="bg-transparent border border-slate-300 dark:border-slate-700 outline-none rounded px-1.5 py-0.5 text-[10px] flex-1 text-slate-800 dark:text-white focus:ring-1 focus:ring-blue-500"
                          />
                          <button type="submit" className="text-emerald-500 hover:scale-110"><Check className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => setEditingConvId(null)} className="text-rose-500 hover:scale-110"><X className="w-3.5 h-3.5" /></button>
                        </form>
                      ) : (
                        <>
                          <span className="truncate pr-1 leading-tight flex-1">{c.title}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                            <button onClick={(e) => handleTogglePin(c.id, e)} className="p-0.5 hover:text-blue-500 hover:bg-blue-500/10 rounded focus:ring-1 focus:ring-blue-500 outline-none" title={isRtl ? 'تثبيت' : 'Pin'}><Pin className="w-3 h-3" /></button>
                            <button onClick={(e) => startRename(c.id, c.title, e)} className="p-0.5 hover:text-blue-500 hover:bg-blue-500/10 rounded focus:ring-1 focus:ring-blue-500 outline-none" title={isRtl ? 'إعادة التسمية' : 'Rename'}><Edit2 className="w-3 h-3" /></button>
                            <button onClick={(e) => { e.stopPropagation(); setShowShareModal(c.id); }} className="p-0.5 hover:text-blue-500 hover:bg-blue-500/10 rounded focus:ring-1 focus:ring-blue-500 outline-none" title={isRtl ? 'مشاركة' : 'Share'}><Share2 className="w-3 h-3" /></button>
                            <button onClick={(e) => handleDeleteConversation(c.id, e)} className="p-0.5 hover:text-rose-500 hover:bg-rose-500/10 rounded focus:ring-1 focus:ring-rose-500 outline-none" title={isRtl ? 'حذف' : 'Delete'}><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* Footer Settings & Telemetry info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 text-[10px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold">{isRtl ? 'حالة المساعد Farah AI' : 'AI Copilot Status'}</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="w-full text-center py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold cursor-pointer transition-colors focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            🛡️ {isRtl ? 'سياسة الخصوصية وحمايات الذكاء' : 'GDPR Safety Consent'}
          </button>
        </div>
      </div>
    </>
  );
});
