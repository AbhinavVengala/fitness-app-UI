import React from 'react';
import NavItem from './NavItem';
import { Shield, Apple, Dumbbell, Settings } from 'lucide-react';

const Navbar = () => {
    return (
        <>
            {/* Mobile Nav */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t md:hidden">
                <nav className="flex justify-around max-w-4xl mx-auto">
                    <NavItem pageName="dashboard" icon={Shield} />
                    <NavItem pageName="mealLogger" icon={Apple} />
                    <NavItem pageName="workoutTracker" icon={Dumbbell} />
                    <NavItem pageName="settings" icon={Settings} />
                </nav>
            </footer>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-4">
                <NavItem pageName="dashboard" icon={Shield} />
                <NavItem pageName="mealLogger" icon={Apple} />
                <NavItem pageName="workoutTracker" icon={Dumbbell} />
                <NavItem pageName="settings" icon={Settings} />
            </nav>
        </>
    );
};

export default Navbar;