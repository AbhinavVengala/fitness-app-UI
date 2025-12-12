import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AuthPage from '../pages/AuthPage';
import ProfileManagementPage from '../pages/ProfileManagementPage';
import ProfileCreationPage from '../pages/ProfileCreationPage';
import AppShell from './AppShell';
import { Loader2 } from 'lucide-react';
import { setLoading } from '../store/slices/authSlice';
import { selectActiveProfile } from '../store/slices/profileSlice';
import { loadDataFromProfile, fetchTodayData, setGoals, setWaterIntake } from '../store/slices/dataSlice';

const MainLayout = () => {
    const dispatch = useDispatch();
    const { isLoading, authUser } = useSelector(state => state.auth);
    const { page, userProfiles } = useSelector(state => state.profile);
    const activeProfile = useSelector(selectActiveProfile);

    // Initial loading effect
    useEffect(() => {
        setTimeout(() => dispatch(setLoading(false)), 500);
    }, [dispatch]);

    // Load data when active profile changes
    useEffect(() => {
        if (activeProfile) {
            // Load profile-level data (goals, water) from the profile object
            dispatch(setGoals(activeProfile.goals || {}));
            dispatch(setWaterIntake(activeProfile.waterIntake || 0));

            // Fetch today's food and workout logs from API
            dispatch(fetchTodayData(activeProfile.id));
        }
    }, [activeProfile, dispatch]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gradient-bg-animated">
                <div className="flex flex-col items-center gap-6 animate-in">
                    {/* Logo */}
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                        <Loader2 size={40} className="animate-spin text-white" />
                    </div>
                    {/* Brand text */}
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">Fitness Tracker</h1>
                        <p className="text-white/70 text-sm">Loading your dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!authUser) {
        return <AuthPage />;
    }

    // If user has no profiles, show profile creation page
    if (!userProfiles || userProfiles.length === 0) {
        return <ProfileCreationPage />;
    }

    // If user has profiles but none selected, show profile selection
    if (!activeProfile) {
        return <ProfileManagementPage />;
    }

    return <AppShell page={page} />;
};

export default MainLayout;
