import React from 'react';
import { useSelector } from 'react-redux';
import NavItem from './NavItem';
import { LayoutDashboard, Apple, Dumbbell, Database, Calendar } from 'lucide-react';

const Navbar = () => {
    const { authUser } = useSelector(state => state.auth);
    const isAdmin = authUser?.isAdmin || false;

    return (
        /* Desktop Nav */
        <nav className="hidden lg:flex items-center gap-1 bg-secondary/50 rounded-xl p-1">
            <NavItem pageName="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem pageName="mealLogger" icon={Apple} label="Meals" />
            <NavItem pageName="workoutTracker" icon={Dumbbell} label="Workout" />
            <NavItem pageName="history" icon={Calendar} label="History" />
            {isAdmin && <NavItem pageName="admin" icon={Database} label="Manage" />}
        </nav>
    );
};

export default Navbar;



