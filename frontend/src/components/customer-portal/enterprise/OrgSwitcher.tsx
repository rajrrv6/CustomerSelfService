import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { MOCK_ORGANIZATIONS } from './constants';
import { OrgWorkspaceCard } from './OrgWorkspaceCard';
import { Organization } from './types';
import { ChevronDown, Search, Building2, Check } from 'lucide-react';

interface OrgSwitcherProps {
  onOrgChange?: (org: Organization) => void;
}

export function OrgSwitcher({ onOrgChange }: OrgSwitcherProps) {
  const { lang, addAuditLog } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<Organization>(MOCK_ORGANIZATIONS[0]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize selected tenant from localStorage if it exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('current_tenant_id');
      if (stored) {
        const found = MOCK_ORGANIZATIONS.find(org => org.tenantId === stored);
        if (found) {
          setSelectedOrg(found);
          if (onOrgChange) onOrgChange(found);
        }
      }
    }
  }, [onOrgChange]);

  // Handle switching
  const handleSelectOrg = (org: Organization) => {
    setSelectedOrg(org);
    localStorage.setItem('current_tenant_id', org.tenantId);
    setIsOpen(false);
    setSearchQuery('');
    setFocusedIndex(-1);
    addAuditLog(`Switched active workspace to ${org.name} (${org.environment})`);
    if (onOrgChange) onOrgChange(org);
  };

  // Filter orgs
  const filteredOrgs = useMemo(() => {
    return MOCK_ORGANIZATIONS.filter(org =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.tenantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.environment.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      setFocusedIndex(-1);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < filteredOrgs.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : filteredOrgs.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredOrgs.length) {
        handleSelectOrg(filteredOrgs[focusedIndex]);
      }
    }
  };

  // Focus scroll management
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const children = listRef.current.children;
      if (children[focusedIndex]) {
        const child = children[focusedIndex] as HTMLElement;
        if (typeof child.scrollIntoView === 'function') {
          child.scrollIntoView({
            block: 'nearest',
          });
        }
      }
    }
  }, [focusedIndex]);

  // Auto focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const t = {
    en: {
      selectOrg: 'Select Workspace',
      searchPlaceholder: 'Search environments...',
      noResults: 'No workspaces match filters',
      activeWorkspace: 'Active Workspace',
    },
    ar: {
      selectOrg: 'اختر بيئة العمل',
      searchPlaceholder: 'ابحث عن بيئات العمل...',
      noResults: 'لا توجد بيئة عمل تطابق التصفية',
      activeWorkspace: 'بيئة العمل النشطة',
    },
  }[lang] || {
    selectOrg: 'Select Workspace',
    searchPlaceholder: 'Search environments...',
    noResults: 'No workspaces match filters',
    activeWorkspace: 'Active Workspace',
  };

  return (
    <div className="relative" ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all duration-200 cursor-pointer text-slate-800 dark:text-slate-200 select-none min-w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center gap-2 text-left" style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
          <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
          <div>
            <span className="block text-xs font-bold truncate leading-tight max-w-[140px]">
              {selectedOrg.name}
            </span>
            <span className="block text-[9px] text-slate-400 font-semibold font-mono leading-none mt-0.5">
              {selectedOrg.tenantId} • {selectedOrg.environment}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute top-12 ${
            lang === 'ar' ? 'left-0' : 'right-0'
          } mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-150 origin-top`}
        >
          {/* Search Input */}
          <div className="relative mb-3">
            <Search className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-2.5 w-4 h-4 text-slate-400`} />
            <input
              ref={inputRef}
              type="text"
              className={`w-full ${
                lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'
              } py-2 border border-slate-250 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium`}
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setFocusedIndex(0);
              }}
            />
          </div>

          {/* List of Orgs */}
          <div
            ref={listRef}
            className="space-y-1.5 max-h-72 overflow-y-auto pr-1"
            style={{ contentVisibility: 'auto' }}
          >
            {filteredOrgs.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-medium py-3 text-center">
                {t.noResults}
              </p>
            ) : (
              filteredOrgs.map((org, index) => {
                const isActive = org.tenantId === selectedOrg.tenantId;
                const isFocused = index === focusedIndex;
                return (
                  <div
                    key={org.tenantId}
                    role="option"
                    aria-selected={isActive}
                    tabIndex={-1}
                    className={`rounded-xl transition-all border ${
                      isFocused
                        ? 'ring-2 ring-blue-500/50 border-blue-500/50'
                        : 'border-transparent'
                    }`}
                  >
                    <OrgWorkspaceCard
                      org={org}
                      isActive={isActive}
                      onSelect={() => handleSelectOrg(org)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
