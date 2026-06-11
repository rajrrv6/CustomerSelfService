import React from 'react';

export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  time: string;
  citations?: string[];
  feedback?: 'up' | 'down' | null;
  isSpeaking?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  date: string;
  pinned: boolean;
  messages: Message[];
}

export interface AttachedFile {
  name: string;
  size: string;
  progress: number;
}

export interface SidebarPanelProps {
  isRtl: boolean;
  conversations: Conversation[];
  activeConvId: string;
  setActiveConvId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  editingConvId: string | null;
  setEditingConvId: (id: string | null) => void;
  editingTitle: string;
  setEditingTitle: (title: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (c: boolean) => void;
  handleNewConversation: () => void;
  handleDeleteConversation: (id: string, e: React.MouseEvent) => void;
  handleTogglePin: (id: string, e: React.MouseEvent) => void;
  saveRename: (id: string, e: React.FormEvent) => void;
  startRename: (id: string, title: string, e: React.MouseEvent) => void;
  setShowShareModal: (id: string | null) => void;
  setShowPrivacyModal: (show: boolean) => void;
}

export interface ChatThreadProps {
  isRtl: boolean;
  activeConv: Conversation;
  isStreaming: boolean;
  streamingText: string;
  speakingMessageId: string | null;
  setSpeakingMessageId: (id: string | null) => void;
  isTtsEnabled: boolean;
  handleCopyText: (text: string) => void;
  handleRateResponse: (id: string, rating: 'up' | 'down') => void;
  simulateAiResponse: (query: string) => void;
  setSelectedCitation: (id: string | null) => void;
  setShowTracePanel: (show: boolean) => void;
  chatBottomRef: React.RefObject<HTMLDivElement | null>;
  setChatInput: (text: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export interface ChatComposerProps {
  isRtl: boolean;
  chatInput: string;
  setChatInput: (text: string) => void;
  isStreaming: boolean;
  isTtsEnabled: boolean;
  setIsTtsEnabled: (val: boolean) => void;
  handleSendMessage: () => void;
  handleComposerKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleFileAttach: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showUrlInput: boolean;
  setShowUrlInput: (show: boolean) => void;
  urlInput: string;
  setUrlInput: (val: string) => void;
  handleUrlAttach: (e: React.FormEvent) => void;
  attachedFiles: AttachedFile[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<AttachedFile[]>>;
  attachedUrls: string[];
  setAttachedUrls: React.Dispatch<React.SetStateAction<string[]>>;
  showSlashMenu: boolean;
  filteredCommands: Array<{ cmd: string; label: string; desc: string; icon: string }>;
  slashMenuIndex: number;
  handleSlashSelect: (cmd: string) => void;
  setIsVoiceActive: (active: boolean) => void;
  isVoiceActive: boolean;
}

export interface CitationsDrawerProps {
  isRtl: boolean;
  selectedCitation: string;
  setSelectedCitation: (id: string | null) => void;
}

export interface TraceLogsDrawerProps {
  isRtl: boolean;
  setShowTracePanel: (show: boolean) => void;
}

export interface VoiceListeningModalProps {
  isRtl: boolean;
  isVoiceActive: boolean;
  setIsVoiceActive: (active: boolean) => void;
  voiceWaveform: number[];
  setVoiceWaveform: (wave: number[]) => void;
  setChatInput: (text: string) => void;
  triggerToast: (msg: string) => void;
}

export interface GDPRPrivacyModalProps {
  isRtl: boolean;
  showPrivacyModal: boolean;
  setShowPrivacyModal: (show: boolean) => void;
  addAuditLog: (action: string, status?: 'success' | 'failed') => void;
}

export interface ExportModalProps {
  isRtl: boolean;
  showExportModal: string | null;
  setShowExportModal: (id: string | null) => void;
  isExporting: boolean;
  handleExportSubmit: () => void;
  exportProgress: number;
  exportFormat: 'pdf' | 'md' | 'json';
  setExportFormat: (fmt: 'pdf' | 'md' | 'json') => void;
}

export interface ShareModalProps {
  isRtl: boolean;
  showShareModal: string | null;
  setShowShareModal: (id: string | null) => void;
  shareExpiration: string;
  setShareExpiration: (exp: string) => void;
  handleShareSubmit: () => void;
}
