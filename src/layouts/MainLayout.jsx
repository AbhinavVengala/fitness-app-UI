import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AuthPage from '../pages/AuthPage';
import LandingPage from '../pages/LandingPage';
import ProfileManagementPage from '../pages/ProfileManagementPage';
import ProfileCreationPage from '../pages/ProfileCreationPage';
import AppShell from './AppShell';
import { Loader2 } from 'lucide-react';
import { restoreSession, logout, setLoading } from '../store/slices/authSlice';
import { resetProfile, selectActiveProfile } from '../store/slices/profileSlice';
import { resetData, fetchTodayData, setGoals, setWaterIntake } from '../store/slices/dataSlice';

import { TermsPage, PrivacyPage } from '../pages/LegalPages';

const MainLayout = () => {
    const dispatch = useDispatch();
    const { isLoading, authUser } = useSelector(state => state.auth);
    const { page, userProfiles } = useSelector(state => state.profile);
    const activeProfile = useSelector(selectActiveProfile);

    const [publicView, setPublicView] = useState('landing'); // landing, auth, terms, privacy

    // Restore session from JWT token on app load
    useEffect(() => {
        dispatch(restoreSession());

        // Listen for auth:logout events (triggered on 401)
        const handleLogout = () => {
            dispatch(logout());
            dispatch(resetProfile());
            dispatch(resetData());
            setPublicView('auth'); // Return to login screen on logout
        };

        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-6 animate-in">
                    {/* Logo */}
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shadow-xl shadow-primary/10">
                        <Loader2 size={40} className="animate-spin text-primary" />
                    </div>
                    {/* Brand text */}
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-foreground mb-2">Fitness Tracker</h1>
                        <p className="text-muted-foreground text-sm">Loading your dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!authUser) {
        switch (publicView) {
            case 'auth':
                return <AuthPage />;
            case 'terms':
                return <TermsPage onBack={() => setPublicView('landing')} />;
            case 'privacy':
                return <PrivacyPage onBack={() => setPublicView('landing')} />;
            default:
                return (
                    <LandingPage
                        onGetStarted={() => setPublicView('auth')}
                        onViewTerms={() => setPublicView('terms')}
                        onViewPrivacy={() => setPublicView('privacy')}
                    />
                );
        }
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

