import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import NavItem from './NavItem';
import { useCart } from '../context/CartContext';
import { setPage } from '../store/slices/profileSlice';
import { LayoutDashboard, Apple, Dumbbell, Database, Calendar, ShoppingBag } from 'lucide-react';

const Navbar = () => {
    const dispatch = useDispatch();
    const { authUser } = useSelector(state => state.auth);
    const { cartItems } = useCart();
    const isAdmin = authUser?.isAdmin || false;

    const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    return (
        <nav className="hidden lg:flex items-center gap-1 bg-secondary/50 rounded-xl p-1">
            <NavItem pageName="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem pageName="mealLogger" icon={Apple} label="Meals" />
            <NavItem pageName="workoutTracker" icon={Dumbbell} label="Workout" />
            <NavItem pageName="foodOrder" icon={ShoppingBag} label="Order" />
            <NavItem pageName="history" icon={Calendar} label="History" />
            {isAdmin && <NavItem pageName="admin" icon={Database} label="Manage" />}
        </nav>
    );
};

export default Navbar;



