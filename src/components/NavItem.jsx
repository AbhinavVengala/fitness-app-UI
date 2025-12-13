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
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }
    `;

    // Desktop styles
    const desktopClasses = `
        hidden md:flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
        ${isActive
            ? 'bg-background text-primary shadow-sm ring-1 ring-border'
            : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
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
