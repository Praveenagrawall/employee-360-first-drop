import { useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    Users,
    Briefcase,
    Network,
    BarChart3,
    MessageSquare,
    TrendingUp,
    Settings,
    ClipboardList,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPendingCount } from '../../api/allocationRequestApi';
import { cn } from '../../utils/cn';
import { Avatar } from '../common/Avatar';
import { useUserContext } from '../../context/UserContextProvider';

interface SidebarProps {
    isMobileOpen: boolean;
    setIsMobileOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
    const location = useLocation();
    const { currentUser, hasAtLeastLevel, hasPermission } = useUserContext();

    // Close mobile sidebar when route changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname, setIsMobileOpen]);

    const { data: pendingCountRes } = useQuery({
        queryKey: ['pendingRequestsCount', currentUser?.employeeId],
        queryFn: async () => {
            const res = await fetchPendingCount();
            return res.data?.data || 0;
        },
        enabled: hasAtLeastLevel(4),
        refetchInterval: 60000
    });
    const pendingCount = pendingCountRes || 0;

    const navItems = useMemo(() => {
        const items = [
            { name: 'Dashboard', path: '/', icon: LayoutDashboard, visible: true },
            { name: 'My Profile', path: `/employees/${currentUser?.employeeId || 15}`, icon: User, visible: true },
            { name: 'Employees', path: '/employees', icon: Users, visible: true },
            { name: 'Projects', path: '/projects', icon: Briefcase, visible: true },
            {
                name: 'Requests',
                path: '/allocation-requests',
                icon: ClipboardList,
                visible: hasAtLeastLevel(4),
                badge: pendingCount > 0 ? pendingCount : undefined
            },
            {
                name: 'Performance',
                path: '/performance',
                icon: BarChart3,
                visible: hasAtLeastLevel(4)
            },
            {
                name: 'Feedback',
                path: '/feedback',
                icon: MessageSquare,
                visible: hasAtLeastLevel(4)
            },
            {
                name: 'Analytics',
                path: '/analytics',
                icon: TrendingUp,
                visible: hasAtLeastLevel(6) || hasPermission('VIEW_ORG_ANALYTICS')
            },
            {
                name: 'Org Chart',
                path: '/org-chart',
                icon: Network,
                visible: hasAtLeastLevel(6)
            },
            {
                name: 'Admin',
                path: '/admin',
                icon: Settings,
                visible: hasAtLeastLevel(7) || hasPermission('ADMIN_PANEL')
            },
        ];
        return items.filter(item => item.visible);
    }, [currentUser, hasAtLeastLevel, hasPermission, pendingCount]);

    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    'fixed top-[64px] left-0 z-40 h-[calc(100vh-64px)] overflow-y-auto bg-sidebar-bg border-r border-[#E5E8EB] flex flex-col transition-all duration-300 ease-in-out w-[240px]',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const myId = currentUser?.employeeId || 15;
                        const myProfilePath = `/employees/${myId}`;

                        const isActive = item.path === '/'
                            ? location.pathname === '/'
                            : item.path === myProfilePath
                                ? location.pathname === myProfilePath
                                : item.path === '/employees'
                                    ? (location.pathname === '/employees' || (location.pathname.startsWith('/employees/') && location.pathname !== myProfilePath))
                                    : location.pathname.startsWith(item.path);

                        return (
                            <NavLink
                                key={item.path}
                                title={item.name}
                                to={item.path}
                                className={cn(
                                    'flex items-center h-[44px] px-4 transition-colors relative group',
                                    isActive
                                        ? 'bg-sidebar-active text-kpmg-blue font-semibold before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-kpmg-blue'
                                        : 'text-text-secondary hover:bg-sidebar-hover hover:text-text-primary'
                                )}
                            >
                                <Icon className={cn('w-[18px] h-[18px] mr-3 shrink-0', isActive ? 'text-kpmg-blue' : 'text-text-muted group-hover:text-text-primary')} />
                                <span className="text-sm truncate flex-1">
                                    {item.name}
                                </span>
                                {item.badge && (
                                    <span className="bg-status-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Bottom User Profile Section */}
                <div className="p-4 border-t border-[#E5E8EB] bg-[#FAFBFD] shrink-0">
                    <div className="flex items-center gap-3">
                        <Avatar
                            name={currentUser?.fullName || 'User'}
                            src={currentUser?.profilePicUrl}
                            size="sm"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-text-primary truncate uppercase tracking-tight">
                                {currentUser?.fullName || 'Loading...'}
                            </p>
                            <p className="text-[10px] text-text-muted truncate leading-tight">
                                {currentUser?.designation}
                            </p>
                            <p className="text-[10px] text-text-muted truncate leading-tight mt-0.5">
                                {currentUser?.department}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
