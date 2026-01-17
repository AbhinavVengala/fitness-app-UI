import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import NavItem from './NavItem';
import { useCart } from '../context/CartContext';
import { setPage } from '../store/slices/profileSlice';
import { LayoutDashboard, Apple, Dumbbell, Database, Calendar, ShoppingBag } from 'lucide-react';

const MobileNavbar = () => {
    const dispatch = useDispatch();
    const { authUser } = useSelector(state => state.auth);
    const { cartItems } = useCart();
    const isAdmin = authUser?.isAdmin || false;

    const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border lg:hidden z-50">
            <nav className="flex justify-around max-w-lg mx-auto py-2">
                <NavItem pageName="dashboard" icon={LayoutDashboard} label="Home" />
                <NavItem pageName="mealLogger" icon={Apple} label="Meals" />
                <NavItem pageName="workoutTracker" icon={Dumbbell} label="Workout" />
                <NavItem pageName="foodOrder" icon={ShoppingBag} label="Order" />
                <NavItem pageName="history" icon={Calendar} label="History" />
                {isAdmin && <NavItem pageName="admin" icon={Database} label="Manage" />}
            </nav>
        </footer>
    );
};

export default MobileNavbar;
