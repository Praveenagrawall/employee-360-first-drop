import React from 'react';
import { useUserContext } from '../../context/UserContextProvider';

interface PermissionGateProps {
    permission?: string;
    minLevel?: number;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function PermissionGate({
    permission,
    minLevel,
    children,
    fallback = null
}: PermissionGateProps) {
    const { hasPermission, hasAtLeastLevel } = useUserContext();

    const canPass = () => {
        const hasPerm = permission ? hasPermission(permission) : true;
        const hasLvl = minLevel ? hasAtLeastLevel(minLevel) : true;
        return hasPerm && hasLvl;
    };

    if (!canPass()) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
