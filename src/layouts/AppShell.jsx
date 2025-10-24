import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Dashboard from '../pages/Dashboard';
import MealLogger from '../pages/MealLogger';
import WorkoutTracker from '../pages/WorkoutTracker';
import SettingsPage from '../pages/SettingsPage';
import { UserCircle, LogOut } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { setActiveProfileId, resetProfile, selectActiveProfile } from '../store/slices/profileSlice';
import Navbar from '../components/Navbar';

const AppShell = ({ page }) => {
    const dispatch = useDispatch();
    const activeProfile = useSelector(selectActiveProfile);
    const { userProfiles } = useSelector(state => state.profile);
    const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(resetProfile());
    }

    const handleProfileSwitch = (profileId) => {
        dispatch(setActiveProfileId(profileId));
        setShowProfileSwitcher(false);
    }

    const renderPage = () => {
        switch (page) {
            case 'dashboard': return <Dashboard />;
            case 'mealLogger': return <MealLogger />;
            case 'workoutTracker': return <WorkoutTracker />;
            case 'settings': return <SettingsPage />;
            default: return <Dashboard />;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-100 font-sans">
          <div className="bg-slate-50">
            <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="font-bold text-lg">Fitness MVP</div>
                <Navbar />
                <div className="relative">
                    <button onClick={() => setShowProfileSwitcher(s => !s)} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100">
                        <UserCircle />
                        <span>{activeProfile?.name || "Select Profile"}</span>
                    </button>
                    {showProfileSwitcher && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border">
                            {userProfiles.map(p => <div key={p.id} onClick={() => handleProfileSwitch(p.id)} className="p-2 hover:bg-gray-100 cursor-pointer">{p.name}</div>)}
                            <div className="border-t p-2 hover:bg-gray-100 cursor-pointer text-red-500" onClick={handleLogout}><LogOut size={16} className="inline mr-2"/>Logout</div>
                        </div>
                    )}
                </div>
            </header>
            <main className="max-w-4xl mx-auto p-4 pb-28">{renderPage()}</main>
          </div>
        </div>
    );
};

export default AppShell;