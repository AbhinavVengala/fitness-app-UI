import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPage } from '../store/slices/profileSlice';

const NavItem = ({ pageName, icon: Icon }) => {
    const dispatch = useDispatch();
    const { page } = useSelector(state => state.profile);
    const isActive = page === pageName;

    const baseClasses = "transition-colors";
    const activeClasses = "text-blue-500";
    const inactiveClasses = "text-gray-500";

    const buttonClasses = `
        flex flex-col items-center justify-center w-full py-2 md:flex-row md:space-x-2 md:px-3 md:py-2 md:rounded-md
        ${baseClasses} 
        ${isActive ? activeClasses : inactiveClasses} 
    `;

    return (
        <button onClick={() => dispatch(setPage(pageName))} className={buttonClasses}>
            <Icon size={20} />
            <span className="font-medium capitalize text-xs mt-1 md:text-sm md:mt-0">{pageName}</span>
        </button>
    );
};

export default NavItem;