/**
 * OwnProfilePage — shortcut to the current user's own profile.
 * Redirects to /employees/:id using the currentUser's employeeId.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContextProvider';
import { FullPageLoader } from '../components/common';

export default function OwnProfilePage() {
    const { currentUser, isLoading } = useUserContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && currentUser) {
            navigate(`/employees/${currentUser.employeeId}`, { replace: true });
        }
    }, [isLoading, currentUser, navigate]);

    return <FullPageLoader message="Loading your profile…" />;
}
