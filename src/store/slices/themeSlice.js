import { createSlice } from '@reduxjs/toolkit';

// Get initial theme from localStorage or system preference
const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;

        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    }
    return 'light';
};

const themeSlice = createSlice({
    name: 'theme',
    initialState: {
        mode: getInitialTheme(),
    },
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', state.mode);
            // Apply to document
            if (state.mode === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },
        setTheme: (state, action) => {
            state.mode = action.payload;
            localStorage.setItem('theme', state.mode);
            if (state.mode === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },
        initializeTheme: (state) => {
            // Apply theme on initial load
            if (state.mode === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }
});

export const { toggleTheme, setTheme, initializeTheme } = themeSlice.actions;
export const selectThemeMode = (state) => state.theme.mode;
export default themeSlice.reducer;
