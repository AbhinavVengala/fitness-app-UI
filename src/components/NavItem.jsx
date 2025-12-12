import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPage } from '../store/slices/profileSlice';

const NavItem = ({ pageName, icon: Icon, label }) => {
    const dispatch = useDispatch();
    const { page } = useSelector(state => state.profile);
    const isActive = page === pageName;

    // Mobile styles
    const mobileClasses = `
        flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-200
        ${isActive
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }
    `;

    // Desktop styles
    const desktopClasses = `
        hidden md:flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
        ${isActive
            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
        }
    `;

    return (
        <>
            {/* Mobile */}
            <button
                onClick={() => dispatch(setPage(pageName))}
                className={`${mobileClasses} md:hidden`}
            >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium mt-1">{label}</span>
            </button>

            {/* Desktop */}
            <button
                onClick={() => dispatch(setPage(pageName))}
                className={desktopClasses}
            >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
            </button>
        </>
    );
};

export default NavItem;
