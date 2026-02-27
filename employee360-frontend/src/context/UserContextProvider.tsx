import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserContext } from '../types/userContext';
import { fetchCurrentUser, switchUser as apiSwitchUser } from '../api/userContextApi';
import { setCurrentUserId } from '../api/axiosInstance';
import { queryClient } from '../queryClient';
import toast from 'react-hot-toast';

interface UserState {
    currentUser: UserContext | null;
    isLoading: boolean;
    error: string | null;
}

type UserAction =
    | { type: 'SET_USER', payload: UserContext }
    | { type: 'SET_LOADING', payload: boolean }
    | { type: 'SET_ERROR', payload: string }
    | { type: 'SWITCH_USER' };

const userReducer = (state: UserState, action: UserAction): UserState => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, currentUser: action.payload, isLoading: false, error: null };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };
        case 'SWITCH_USER':
            return { ...state, isLoading: true };
        default:
            return state;
    }
};

interface UserContextType extends UserState {
    switchUser: (employeeId: number) => Promise<void>;
    hasPermission: (permission: string) => boolean;
    isManager: () => boolean;
    isLeadership: () => boolean;
    hasAtLeastLevel: (level: number) => boolean;
    refetchUser: () => Promise<void>;
}

const UserContextInstance = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, {
        currentUser: null,
        isLoading: true,
        error: null,
    });

    const loadUser = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const { data } = await fetchCurrentUser();
            dispatch({ type: 'SET_USER', payload: data.data });
            return data.data;
        } catch (err: any) {
            dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to fetch user' });
            console.error('Error fetching user:', err);
            return null;
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const switchUserHandler = async (employeeId: number) => {
        dispatch({ type: 'SWITCH_USER' });
        try {
            await apiSwitchUser(employeeId);
            setCurrentUserId(employeeId);
            // Invalidate ALL cached queries so every page refetches with the new user identity
            await queryClient.invalidateQueries();
            const newUser = await loadUser();
            if (newUser) {
                toast.success(`Switched to ${newUser.fullName}`, { duration: 3000 });
                toast(`Viewing as: ${newUser.designation} (${newUser.dashboardType})`,
                    { icon: 'ℹ️', duration: 4000 });
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to switch user';
            dispatch({ type: 'SET_ERROR', payload: message });
            toast.error('Failed to switch user');
        }
    };


    const hasPermission = (permission: string) => {
        return state.currentUser?.permissions.includes(permission) || false;
    };

    const isManager = () => {
        return state.currentUser?.dashboardType === 'MANAGER';
    };

    const isLeadership = () => {
        return state.currentUser?.dashboardType === 'LEADERSHIP';
    };

    const hasAtLeastLevel = (level: number) => {
        return (state.currentUser?.designationLevel || 0) >= level;
    };

    return (
        <UserContextInstance.Provider value={{
            ...state,
            switchUser: switchUserHandler,
            hasPermission,
            isManager,
            isLeadership,
            hasAtLeastLevel,
            refetchUser: loadUser
        }}>
            {children}
        </UserContextInstance.Provider>
    );
};

export const useUserContext = () => {
    const context = useContext(UserContextInstance);
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserContextProvider');
    }
    return context;
};
