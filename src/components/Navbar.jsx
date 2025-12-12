import React from 'react';
import { useSelector } from 'react-redux';
import NavItem from './NavItem';
import { LayoutDashboard, Apple, Dumbbell, Database, Calendar } from 'lucide-react';

const Navbar = () => {
    const { authUser } = useSelector(state => state.auth);
    const isAdmin = authUser?.isAdmin || false;

    return (
        <>
            {/* Mobile Nav */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50 md:hidden z-50">
                <nav className="flex justify-around max-w-lg mx-auto py-2">
                    <NavItem pageName="dashboard" icon={LayoutDashboard} label="Home" />
                    <NavItem pageName="mealLogger" icon={Apple} label="Meals" />
                    <NavItem pageName="workoutTracker" icon={Dumbbell} label="Workout" />
                    <NavItem pageName="history" icon={Calendar} label="History" />
                    {isAdmin && <NavItem pageName="admin" icon={Database} label="Manage" />}
                </nav>
            </footer>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl p-1">
                <NavItem pageName="dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem pageName="mealLogger" icon={Apple} label="Meals" />
                <NavItem pageName="workoutTracker" icon={Dumbbell} label="Workout" />
                <NavItem pageName="history" icon={Calendar} label="History" />
                {isAdmin && <NavItem pageName="admin" icon={Database} label="Manage" />}
            </nav>
        </>
    );
};

export default Navbar;



