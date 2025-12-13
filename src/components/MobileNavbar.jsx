import React from 'react';
import { useSelector } from 'react-redux';
import NavItem from './NavItem';
import { LayoutDashboard, Apple, Dumbbell, Database, Calendar } from 'lucide-react';

const MobileNavbar = () => {
    const { authUser } = useSelector(state => state.auth);
    const isAdmin = authUser?.isAdmin || false;

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border lg:hidden z-50">
            <nav className="flex justify-around max-w-lg mx-auto py-2">
                <NavItem pageName="dashboard" icon={LayoutDashboard} label="Home" />
                <NavItem pageName="mealLogger" icon={Apple} label="Meals" />
                <NavItem pageName="workoutTracker" icon={Dumbbell} label="Workout" />
                <NavItem pageName="history" icon={Calendar} label="History" />
                {isAdmin && <NavItem pageName="admin" icon={Database} label="Manage" />}
            </nav>
        </footer>
    );
};

export default MobileNavbar;
