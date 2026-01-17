import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPage } from '../store/slices/profileSlice';

const NavItem = ({ pageName, icon: Icon, label, badge }) => {
    const dispatch = useDispatch();
    const { page } = useSelector(state => state.profile);
    const isActive = page === pageName;

    const mobileClasses = `
        flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 relative
        ${isActive
            ? 'text-primary dark:text-white'
            : 'text-muted-foreground hover:text-foreground'
        }
    `;

    const desktopClasses = `
        hidden md:flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 relative
        ${isActive
            ? 'bg-background text-primary dark:text-white shadow-sm ring-1 ring-border'
            : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
        }
    `;

    return (
        <>
            <button
                onClick={() => dispatch(setPage(pageName))}
                className={`${mobileClasses} md:hidden`}
            >
                <div className="relative">
                    <Icon className="w-5 h-5" />
                    {badge > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {badge}
                        </span>
                    )}
                </div>
                <span className="text-[10px] font-medium mt-1">{label}</span>
            </button>

            {/* Desktop */}
            <button
                onClick={() => dispatch(setPage(pageName))}
                className={desktopClasses}
            >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
                {badge > 0 && (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {badge}
                    </span>
                )}
            </button>
        </>
    );
};

export default NavItem;
