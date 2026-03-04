import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

// Mock localStorage before importing the slice
const localStorageMock = {
    store: {},
    getItem: vi.fn((key) => localStorageMock.store[key] || null),
    setItem: vi.fn((key, value) => { localStorageMock.store[key] = value; }),
    removeItem: vi.fn((key) => { delete localStorageMock.store[key]; }),
    clear: vi.fn(() => { localStorageMock.store = {}; }),
};
globalThis.localStorage = localStorageMock;

// jsdom does not implement matchMedia; mock it before the slice runs
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Spy on document.documentElement.classList (jsdom provides the real DOM)
const classListAddSpy = vi.spyOn(document.documentElement.classList, 'add').mockImplementation(() => { });
const classListRemoveSpy = vi.spyOn(document.documentElement.classList, 'remove').mockImplementation(() => { });

// Now import the slice after mocks are set up
const { default: themeReducer, toggleTheme, setTheme, initializeTheme, selectThemeMode } = await import('./themeSlice');



function createTestStore(preloadedState = {}) {
    return configureStore({
        reducer: { theme: themeReducer },
        preloadedState: { theme: { mode: 'light', ...preloadedState } },
    });
}

describe('themeSlice', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.store = {};
    });

    describe('reducers', () => {
        it('should have light as default mode', () => {
            const store = createTestStore();

            expect(store.getState().theme.mode).toBe('light');
        });

        it('toggleTheme should switch light to dark', () => {
            const store = createTestStore({ mode: 'light' });

            store.dispatch(toggleTheme());

            expect(store.getState().theme.mode).toBe('dark');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
            expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
        });

        it('toggleTheme should switch dark to light', () => {
            const store = createTestStore({ mode: 'dark' });

            store.dispatch(toggleTheme());

            expect(store.getState().theme.mode).toBe('light');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
            expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
        });

        it('setTheme to dark applies dark class', () => {
            const store = createTestStore({ mode: 'light' });

            store.dispatch(setTheme('dark'));

            expect(store.getState().theme.mode).toBe('dark');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
        });

        it('setTheme to light removes dark class', () => {
            const store = createTestStore({ mode: 'dark' });

            store.dispatch(setTheme('light'));

            expect(store.getState().theme.mode).toBe('light');
            expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
        });

        it('initializeTheme applies current theme to document', () => {
            const store = createTestStore({ mode: 'dark' });

            store.dispatch(initializeTheme());

            expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
        });

        it('initializeTheme light mode removes dark class', () => {
            const store = createTestStore({ mode: 'light' });

            store.dispatch(initializeTheme());

            expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
        });
    });

    describe('selectors', () => {
        it('selectThemeMode returns current mode', () => {
            const store = createTestStore({ mode: 'dark' });

            expect(selectThemeMode(store.getState())).toBe('dark');
        });

        it('selectThemeMode returns light by default', () => {
            const store = createTestStore();

            expect(selectThemeMode(store.getState())).toBe('light');
        });
    });
});
