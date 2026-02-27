import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUserContext } from '../../context/UserContextProvider';
import { FullPageLoader } from './Loader';


interface ProtectedRouteProps {
    /** Minimum designationLevel required to access this route */
    minLevel?: number;
    /** Permission string required to access this route */
    permission?: string;
    children: React.ReactNode;
}

/**
 * Wraps a route so that unauthorized users are redirected to /dashboard
 * with an explanatory toast notification.
 */
export function ProtectedRoute({ minLevel, permission, children }: ProtectedRouteProps) {
    const { currentUser, isLoading } = useUserContext();
    const navigate = useNavigate();

    const meetsLevel = minLevel === undefined
        ? true
        : (currentUser?.designationLevel ?? 0) >= minLevel;

    const meetsPermission = permission === undefined
        ? true
        : currentUser?.permissions.includes(permission) ?? false;

    const hasAccess = meetsLevel && meetsPermission;

    useEffect(() => {
        if (!isLoading && currentUser && !hasAccess) {
            toast.error("You don't have access to this page", { id: 'access-denied', duration: 3500 });
            navigate('/dashboard', { replace: true });
        }
    }, [isLoading, currentUser, hasAccess, navigate]);

    if (isLoading) return <FullPageLoader message="Verifying access…" />;
    if (!currentUser) return null;
    if (!hasAccess) return null;

    return <>{children}</>;
}
