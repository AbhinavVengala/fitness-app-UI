import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Dashboard from '../pages/Dashboard';
import MealLogger from '../pages/MealLogger';
import WorkoutTracker from '../pages/WorkoutTracker';
import SettingsPage from '../pages/SettingsPage';
import AdminPage from '../pages/AdminPage';
import HistoryPage from '../pages/HistoryPage';
import { UserCircle, LogOut, ChevronDown, Settings } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { setActiveProfileId, resetProfile, selectActiveProfile, setPage } from '../store/slices/profileSlice';
import { resetData } from '../store/slices/dataSlice';
import { initializeTheme } from '../store/slices/themeSlice';
import Navbar from '../components/Navbar';
import MobileNavbar from '../components/MobileNavbar';
import ThemeToggle from '../components/ThemeToggle';
import FeedbackModal from '../components/FeedbackModal';
import { MessageSquare } from 'lucide-react';

const AppShell = ({ page }) => {
    const dispatch = useDispatch();
    const activeProfile = useSelector(selectActiveProfile);
    const { userProfiles } = useSelector(state => state.profile);
    const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    // Initialize theme on mount
    useEffect(() => {
        dispatch(initializeTheme());
    }, [dispatch]);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(resetProfile());
        dispatch(resetData());
    }

    const handleProfileSwitch = (profileId) => {
        dispatch(setActiveProfileId(profileId));
        setShowProfileSwitcher(false);
    }

    const handleNavigateToProfile = () => {
        dispatch(setPage('profile'));
        setShowProfileSwitcher(false);
    }

    const renderPage = () => {
        switch (page) {
            case 'dashboard': return <Dashboard />;
            case 'mealLogger': return <MealLogger />;
            case 'workoutTracker': return <WorkoutTracker />;
            case 'history': return <HistoryPage />;
            case 'profile': return <SettingsPage />;
            case 'settings': return <SettingsPage />;
            case 'admin': return <AdminPage />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="text-primary-foreground font-bold text-lg">F</span>
                            </div>
                            <span className="font-bold text-xl text-foreground hidden xl:block">
                                Fitness Tracker
                            </span>
                        </div>

                        {/* Desktop Nav */}
                        <Navbar />

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            <ThemeToggle />

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileSwitcher(s => !s)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
                                        <UserCircle className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-foreground">
                                        {activeProfile?.name || "Select Profile"}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileSwitcher ? 'rotate-180' : ''}`} />
                                </button>

                                {showProfileSwitcher && (
                                    <div className="absolute right-0 mt-2 w-56 modal-surface rounded-xl overflow-hidden animate-in">
                                        <div className="p-2">
                                            {userProfiles.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => handleProfileSwitch(p.id)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${p.id === activeProfile?.id
                                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-white'
                                                        : 'hover:bg-secondary text-foreground dark:text-white'
                                                        }`}
                                                >
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="border-t border-border p-2">
                                            <button
                                                onClick={handleNavigateToProfile}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground dark:text-white hover:bg-secondary transition-colors"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Profile Settings
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowFeedback(true);
                                                    setShowProfileSwitcher(false);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground dark:text-white hover:bg-secondary transition-colors"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                Give Feedback
                                            </button>
                                        </div>
                                        <div className="border-t border-border p-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-6 pb-28 lg:pb-8">
                {renderPage()}
            </main>

            <MobileNavbar />
            <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
        </div>
    );
};

export default AppShell;
