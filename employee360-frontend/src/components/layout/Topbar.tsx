import { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, Bell, Search, Clock, FolderOpen, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { useGlobalSearch } from '../../hooks/useSearch';
import { RoleSwitcher } from './RoleSwitcher';
import { useUserContext } from '../../context/UserContextProvider';
import { useQuery } from '@tanstack/react-query';
import { fetchPendingCount, fetchRequestSummary } from '../../api/allocationRequestApi';

// ─── LocalStorage helper for recent searches ─────────────────────────
const LS_KEY = 'e360_recent_searches';
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function addRecentSearch(query: string) {
    const existing = getRecentSearches().filter(s => s !== query);
    const updated = [query, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
}

function clearRecentSearches() {
    localStorage.removeItem(LS_KEY);
}

// ─── Types for flat result list ──────────────────────────────────────
interface SearchItem {
    id: number;
    type: 'employee' | 'project';
    name: string;
    subtitle: string;
    avatarUrl?: string | null;
}

// ─── Component ───────────────────────────────────────────────────────
interface TopbarProps {
    onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
    const navigate = useNavigate();
    const { currentUser, switchUser, hasAtLeastLevel } = useUserContext();

    // Search state
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches());
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Fetch pending count
    const { data: pendingCountRes } = useQuery({
        queryKey: ['pendingRequestsCountTop', currentUser?.employeeId],
        queryFn: async () => {
            const res = await fetchPendingCount();
            return res.data?.data || 0;
        },
        enabled: hasAtLeastLevel(4),
        refetchInterval: 60000
    });
    const pendingCount = pendingCountRes || 0;

    // Fetch summary on open
    const { data: summaryRes, isLoading: isSummaryLoading } = useQuery({
        queryKey: ['allocationSummary', currentUser?.employeeId],
        queryFn: async () => {
            const res = await fetchRequestSummary();
            return res.data?.data;
        },
        enabled: isNotificationOpen && hasAtLeastLevel(4)
    });
    const summary = summaryRes;

    // Fetch search results via debounced hook
    const { data: results, isLoading, isFetching } = useGlobalSearch(query);

    const currentSimId = localStorage.getItem('e360_sim_user_id') || '15';
    const isViewingAsOthers = currentSimId !== '15';

    // Build flat result list for keyboard navigation
    const flatResults: SearchItem[] = [];
    if (results) {
        results.employees.forEach(emp => {
            flatResults.push({
                id: emp.id,
                type: 'employee',
                name: emp.fullName,
                subtitle: emp.designationName,
                avatarUrl: emp.profilePicUrl,
            });
        });
        results.projects.forEach(proj => {
            flatResults.push({
                id: proj.id,
                type: 'project',
                name: proj.name,
                subtitle: `${proj.type} · ${proj.clientName}`,
            });
        });
    }

    const showDropdown = isFocused && (query.length >= 2 || recentSearches.length > 0);
    const hasResults = flatResults.length > 0;

    // Close dropdowns on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsFocused(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
                setIsNotificationOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);




    // Navigate to a result
    const selectResult = useCallback((item: SearchItem) => {
        const path = item.type === 'employee' ? `/employees/${item.id}` : `/projects/${item.id}`;
        addRecentSearch(query);
        setRecentSearches(getRecentSearches());
        setQuery('');
        setIsFocused(false);
        navigate(path);
    }, [navigate, query]);

    // Navigate from recent search
    const selectRecentSearch = (term: string) => {
        setQuery(term);
        inputRef.current?.focus();
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, flatResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < flatResults.length) {
                selectResult(flatResults[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsFocused(false);
            inputRef.current?.blur();
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-[64px] w-full bg-header-gradient flex flex-col justify-center z-50 shadow-sm">
            {isViewingAsOthers && (
                <div className="bg-red-600 text-white px-4 py-0.5 flex items-center justify-between text-[10px] font-bold tracking-tight shrink-0">
                    <div className="flex items-center space-x-2">
                        <span className="bg-white/20 px-1 py-0 rounded uppercase">Simulation Mode</span>
                        <span>Viewing as: <span className="underline">{currentUser?.fullName}</span></span>
                    </div>
                    <button
                        onClick={() => switchUser(15)}
                        className="bg-white text-red-600 px-1.5 py-0 rounded hover:bg-red-50 transition-colors uppercase"
                    >
                        Reset
                    </button>
                </div>
            )}

            <div className="flex-1 flex items-center justify-between px-4">
                {/* Left: Logo + Mobile toggle */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-3xl tracking-tight">KPMG</span>
                        <div className="h-5 w-[1px] bg-white/20 mx-1 hidden sm:block" />
                        <span className="text-white/90 font-medium text-sm uppercase tracking-widest hidden sm:block">Employee 360</span>
                    </div>
                </div>

                {/* Center: Compact Global Search */}
                <div className="flex-1 max-w-[480px] mx-12 relative hidden md:block" ref={containerRef}>
                    <div className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={e => { setQuery(e.target.value); setActiveIndex(-1); }}
                                onFocus={() => { setIsFocused(true); setRecentSearches(getRecentSearches()); }}
                                onKeyDown={handleKeyDown}
                                placeholder="Search employees, projects…"
                                className="w-full pl-10 pr-10 h-9 text-sm bg-white/15 border border-white/20 rounded text-white placeholder:text-white/70 focus:bg-white focus:text-text-primary focus:outline-none focus:ring-1 focus:ring-white/40 transition-all"
                            />
                            {query.length > 0 && (
                                <button
                                    onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                                >
                                    {isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                </button>
                            )}
                        </div>

                        {/* Dropdown Panel - Restyled for corporate look */}
                        {showDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E8EB] rounded shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                                {query.length < 2 && recentSearches.length > 0 && (
                                    <div className="py-1">
                                        <div className="px-4 py-2 flex items-center justify-between border-b border-[#F4F6F9]">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Recent</span>
                                            <button
                                                onClick={() => { clearRecentSearches(); setRecentSearches([]); }}
                                                className="text-[11px] text-text-link hover:underline"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                        {recentSearches.map(term => (
                                            <button
                                                key={term}
                                                onClick={() => selectRecentSearch(term)}
                                                className="w-full px-4 py-2 flex items-center gap-3 hover:bg-sidebar-hover text-left transition-colors"
                                            >
                                                <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                                <span className="text-sm text-text-primary">{term}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {query.length >= 2 && (
                                    <div className="py-1">
                                        {isLoading && !hasResults && (
                                            <div className="flex items-center justify-center py-6 text-text-muted">
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                <span className="text-xs">Searching…</span>
                                            </div>
                                        )}

                                        {!isLoading && !hasResults && (
                                            <div className="py-6 text-center text-xs text-text-muted">
                                                No matches for "<span className="font-semibold text-text-primary">{query}</span>"
                                            </div>
                                        )}

                                        {hasResults && results && (
                                            <>
                                                {results.employees.length > 0 && (
                                                    <div className="border-b border-[#F4F6F9]">
                                                        <div className="px-4 py-1.5 bg-[#FAFBFD]">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Employees</span>
                                                        </div>
                                                        {results.employees.map((emp) => {
                                                            const idx = flatResults.findIndex(r => r.type === 'employee' && r.id === emp.id);
                                                            return (
                                                                <button
                                                                    key={`e-${emp.id}`}
                                                                    onClick={() => selectResult({ id: emp.id, type: 'employee', name: emp.fullName, subtitle: emp.designationName, avatarUrl: emp.profilePicUrl })}
                                                                    className={`w-full px-4 py-2 flex items-center gap-3 text-left transition-colors ${activeIndex === idx ? 'bg-sidebar-active' : 'hover:bg-sidebar-hover'}`}
                                                                >
                                                                    <Avatar name={emp.fullName} src={emp.profilePicUrl} size="sm" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-semibold text-text-primary truncate">{emp.fullName}</p>
                                                                        <p className="text-[11px] text-text-secondary truncate">{emp.designationName}</p>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {results.projects.length > 0 && (
                                                    <div>
                                                        <div className="px-4 py-1.5 bg-[#FAFBFD]">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Projects</span>
                                                        </div>
                                                        {results.projects.map((proj) => {
                                                            const idx = flatResults.findIndex(r => r.type === 'project' && r.id === proj.id);
                                                            return (
                                                                <button
                                                                    key={`p-${proj.id}`}
                                                                    onClick={() => selectResult({ id: proj.id, type: 'project', name: proj.name, subtitle: `${proj.type} · ${proj.clientName}` })}
                                                                    className={`w-full px-4 py-2 flex items-center gap-3 text-left transition-colors ${activeIndex === idx ? 'bg-sidebar-active' : 'hover:bg-sidebar-hover'}`}
                                                                >
                                                                    <div className="w-7 h-7 rounded bg-[#E8F0FE] flex items-center justify-center shrink-0">
                                                                        <FolderOpen className="w-3.5 h-3.5 text-kpmg-blue" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-semibold text-text-primary truncate">{proj.name}</p>
                                                                        <p className="text-[11px] text-text-secondary truncate">{proj.clientName}</p>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
                                                    className="w-full py-2.5 text-xs font-bold text-kpmg-blue hover:bg-sidebar-hover transition-colors text-center border-t border-[#F4F6F9]"
                                                >
                                                    View all {results.totalResults} results
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Notifications + Role Switcher */}
                <div className="flex items-center gap-2">
                    <div className="relative" ref={notificationRef}>
                        <button
                            title="Notifications"
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className={`p-2.5 rounded transition-colors relative ${isNotificationOpen ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                        >
                            <Bell className="w-5 h-5" />
                            {pendingCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-status-error rounded-full ring-2 ring-[#0056B3]" />
                            )}
                        </button>

                        {isNotificationOpen && hasAtLeastLevel(4) && (
                            <div className="absolute top-full right-0 mt-2 w-[340px] bg-white border border-[#E5E8EB] rounded shadow-xl overflow-hidden z-50">
                                <div className="px-4 py-3 border-b border-[#F4F6F9] flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                                    {pendingCount > 0 && (
                                        <span className="bg-status-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount} New</span>
                                    )}
                                </div>
                                <div className="max-h-[360px] overflow-y-auto">
                                    {isSummaryLoading ? (
                                        <div className="p-8 flex justify-center text-text-muted"><Loader2 className="w-5 h-5 animate-spin" /></div>
                                    ) : summary?.recentRequests && summary.recentRequests.length > 0 ? (
                                        <div className="divide-y divide-[#F4F6F9]">
                                            {summary.recentRequests.slice(0, 5).map((req: any) => (
                                                <div key={req.id} className="p-4 hover:bg-sidebar-hover transition-colors cursor-pointer" onClick={() => { setIsNotificationOpen(false); navigate('/allocation-requests'); }}>
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                            <FolderOpen className="w-4 h-4 text-kpmg-blue" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-900">
                                                                <span className="font-semibold">{req.requesterName}</span> requested <span className="font-semibold">{req.employeeName}</span> for <span className="font-semibold">{req.projectName}</span>
                                                            </p>
                                                            <p className="text-xs text-text-muted mt-1">{req.requestedAllocation}% Allocation • {req.status}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-sm text-text-muted">
                                            No new notifications
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 border-t border-[#F4F6F9] bg-[#FAFBFD]">
                                    <button
                                        onClick={() => { setIsNotificationOpen(false); navigate('/allocation-requests'); }}
                                        className="w-full py-2 text-xs font-bold text-kpmg-blue hover:bg-sidebar-hover rounded transition-colors text-center"
                                    >
                                        View All Requests
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />

                    <RoleSwitcher />
                </div>
            </div>
        </header>
    );
}
