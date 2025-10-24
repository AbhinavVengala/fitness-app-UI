import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AuthPage from '../pages/AuthPage';
import ProfileManagementPage from '../pages/ProfileManagementPage';
import AppShell from './AppShell';
import { Loader2 } from 'lucide-react';
import { setLoading } from '../store/slices/authSlice';
import { selectActiveProfile } from '../store/slices/profileSlice';
import { loadDataFromProfile } from '../store/slices/dataSlice';

const MainLayout = () => {
    const dispatch = useDispatch();
    const { isLoading, authUser } = useSelector(state => state.auth);
    const { page } = useSelector(state => state.profile);
    const activeProfile = useSelector(selectActiveProfile);

    useEffect(() => {
        setTimeout(() => dispatch(setLoading(false)), 500);
    }, [dispatch]);

    useEffect(() => {
        if (activeProfile) {
            dispatch(loadDataFromProfile(activeProfile));
        }
    }, [activeProfile, dispatch]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen"><Loader2 size={48} className="animate-spin text-blue-500"/></div>;
    }

    if (!authUser) {
        return <AuthPage />;
    }

    if (!activeProfile) {
        return <ProfileManagementPage />;
    }

    return <AppShell page={page} />;
};

export default MainLayout;