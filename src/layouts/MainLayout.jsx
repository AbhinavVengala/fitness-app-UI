import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AuthPage from '../pages/AuthPage';
import LandingPage from '../pages/LandingPage';
import ProfileManagementPage from '../pages/ProfileManagementPage';
import ProfileCreationPage from '../pages/ProfileCreationPage';
import AppShell from './AppShell';
import { Loader2 } from 'lucide-react';
import { restoreSession, logout, setLoading } from '../store/slices/authSlice';
import { resetProfile, selectActiveProfile, loadUserProfiles } from '../store/slices/profileSlice';
import { resetData, fetchTodayData, setGoals, setWaterIntake } from '../store/slices/dataSlice';
import { profileApi } from '../api';

import { TermsPage, PrivacyPage } from '../pages/LegalPages';

const MainLayout = () => {
    const dispatch = useDispatch();
    const { isLoading, authUser } = useSelector(state => state.auth);
    const { page, userProfiles } = useSelector(state => state.profile);
    const activeProfile = useSelector(selectActiveProfile);

    const [publicView, setPublicView] = useState('landing'); // landing, auth, terms, privacy

    // Restore session from JWT token on app load
    useEffect(() => {
        const init = async () => {
            const result = await dispatch(restoreSession());

            // After restoring session, fetch fresh profiles via the /profiles endpoint.
            // This triggers ProfileService.checkAndResetWater() on the backend,
            // ensuring waterIntake is 0 if the date has changed since last login.
            if (result.meta.requestStatus === 'fulfilled' && result.payload?.id) {
                try {
                    const freshProfiles = await profileApi.getProfiles(result.payload.id);
                    if (freshProfiles?.length > 0) {
                        dispatch(loadUserProfiles(freshProfiles));
                    }
                } catch (e) {
                    // Non-critical — stale data still works, client-side date check will catch it
                }
            }
        };

        init();

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
            const today = new Date().toISOString().split('T')[0];

            // Client-side safety: reset water if lastWaterDate is not today.
            // This catches cases where the backend reset hasn't propagated yet.
            const isStaleWater = activeProfile.lastWaterDate && activeProfile.lastWaterDate !== today;
            const effectiveWater = isStaleWater ? 0 : (activeProfile.waterIntake || 0);

            dispatch(setGoals(activeProfile.goals || {}));
            dispatch(setWaterIntake(effectiveWater));

            // Fetch today's food and workout logs from API
            dispatch(fetchTodayData(activeProfile.id));
        }
    }, [activeProfile, dispatch]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-6 animate-in">
                    {/* Logo */}
                    <div className="relative w-20 h-20">
                        <img src="/icon-512.png" alt="PacePlate" className="w-20 h-20 rounded-2xl object-cover shadow-xl shadow-primary/20" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Loader2 size={14} className="animate-spin text-white" />
                        </div>
                    </div>
                    {/* Brand text */}
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-foreground mb-1">
                            Pace<span className="text-primary">Plate</span>
                        </h1>
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

