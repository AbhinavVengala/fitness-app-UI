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
import ThemeToggle from '../components/ThemeToggle';

const AppShell = ({ page }) => {
    const dispatch = useDispatch();
    const activeProfile = useSelector(selectActiveProfile);
    const { userProfiles } = useSelector(state => state.profile);
    const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 font-sans transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">F</span>
                            </div>
                            <span className="font-bold text-xl text-gray-800 dark:text-white hidden sm:block">
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
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center">
                                        <UserCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {activeProfile?.name || "Select Profile"}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showProfileSwitcher ? 'rotate-180' : ''}`} />
                                </button>

                                {showProfileSwitcher && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in">
                                        <div className="p-2">
                                            {userProfiles.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => handleProfileSwitch(p.id)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${p.id === activeProfile?.id
                                                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                                                        }`}
                                                >
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                                            <button
                                                onClick={handleNavigateToProfile}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Profile Settings
                                            </button>
                                        </div>
                                        <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
            <main className="max-w-6xl mx-auto px-4 py-6 pb-28 md:pb-8">
                {renderPage()}
            </main>
        </div>
    );
};

export default AppShell;
