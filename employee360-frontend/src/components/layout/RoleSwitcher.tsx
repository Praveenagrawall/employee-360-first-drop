import { useState, useRef, useEffect } from 'react';
import { useUserContext } from '../../context/UserContextProvider';
import { fetchSwitchableUsers } from '../../api/userContextApi';
import { Search, ChevronDown, User, Shield, Users, LogOut, RefreshCw } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { cn } from '../../utils/cn';

interface SwitchableUser {
    id: number;
    fullName: string;
    designationName: string;
    designationLevel: number;
    department: string;
}

export function RoleSwitcher() {
    const { currentUser, switchUser, isLoading } = useUserContext();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<SwitchableUser[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && users.length === 0) {
            const loadUsers = async () => {
                setIsFetching(true);
                try {
                    const { data } = await fetchSwitchableUsers();
                    setUsers(data.data);
                } catch (err) {
                    console.error('Failed to load switchable users:', err);
                } finally {
                    setIsFetching(false);
                }
            };
            loadUsers();
        }
    }, [isOpen, users.length]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!currentUser) return null;

    const filteredUsers = users.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.designationName.toLowerCase().includes(search.toLowerCase()) ||
        u.department.toLowerCase().includes(search.toLowerCase())
    );

    const groupedUsers = {
        LEADERSHIP: filteredUsers.filter(u => u.designationLevel >= 6),
        MANAGEMENT: filteredUsers.filter(u => u.designationLevel >= 4 && u.designationLevel <= 5),
        INDIVIDUAL: filteredUsers.filter(u => u.designationLevel <= 3)
    };

    const currentSimId = localStorage.getItem('e360_sim_user_id') || '15';
    const isViewingAsOthers = currentSimId !== '15';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center space-x-3 px-3 py-1.5 rounded transition-all",
                    isOpen ? 'bg-white/20' : 'hover:bg-white/10'
                )}
            >
                <Avatar name={currentUser.fullName} src={currentUser.profilePicUrl} size="sm" />
                <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-white truncate max-w-[150px]">
                        {currentUser.fullName}
                    </p>
                    <p className="text-[10px] text-white/80 uppercase tracking-widest font-bold">
                        {currentUser.designation}
                    </p>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-white/70 transition-transform", isOpen ? 'rotate-180' : '')} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto pb-2">
                        {isFetching && (
                            <div className="p-8 text-center text-gray-400">
                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                <p className="text-xs">Loading switchable users...</p>
                            </div>
                        )}

                        {!isFetching && (
                            <>
                                {Object.entries(groupedUsers).map(([group, groupUsers]) => (
                                    groupUsers.length > 0 && (
                                        <div key={group}>
                                            <div className="px-4 py-2 bg-gray-50/50 flex items-center space-x-2">
                                                {group === 'LEADERSHIP' && <Shield className="w-3 h-3 text-primary" />}
                                                {group === 'MANAGEMENT' && <Users className="w-3 h-3 text-secondary" />}
                                                {group === 'INDIVIDUAL' && <User className="w-3 h-3 text-gray-400" />}
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                    {group}
                                                </span>
                                            </div>
                                            {groupUsers.map(user => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => {
                                                        switchUser(user.id);
                                                        setIsOpen(false);
                                                    }}
                                                    disabled={isLoading}
                                                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-primary-50 transition-colors text-left group ${user.id === currentUser.employeeId ? 'bg-primary-50 pointer-events-none' : ''
                                                        }`}
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium text-text-primary group-hover:text-primary">
                                                            {user.fullName}
                                                        </p>
                                                        <p className="text-xs text-text-secondary italic">
                                                            {user.designationName} • {user.department}
                                                        </p>
                                                    </div>
                                                    {user.id === currentUser.employeeId && (
                                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )
                                ))}
                            </>
                        )}
                    </div>

                    {isViewingAsOthers && (
                        <div className="p-2 border-t border-gray-100 bg-red-50">
                            <button
                                onClick={() => switchUser(15)}
                                className="w-full flex items-center justify-center space-x-2 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Reset to Default (Praveen)</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
