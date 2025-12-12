import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sun, Moon } from 'lucide-react';
import { toggleTheme, selectThemeMode } from '../store/slices/themeSlice';

const ThemeToggle = ({ className = '' }) => {
    const dispatch = useDispatch();
    const themeMode = useSelector(selectThemeMode);
    const isDark = themeMode === 'dark';

    return (
        <button
            onClick={() => dispatch(toggleTheme())}
            className={`theme-toggle ${className}`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <Sun className="w-5 h-5 text-amber-300" />
            ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
            )}
        </button>
    );
};

export default ThemeToggle;

