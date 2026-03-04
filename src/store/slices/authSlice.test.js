import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logout, setAuthError, setLoading, clearError } from './authSlice';

// Mock localStorage for Node.js test environment
const localStorageMock = {
    store: {},
    getItem: vi.fn((key) => localStorageMock.store[key] || null),
    setItem: vi.fn((key, value) => { localStorageMock.store[key] = value; }),
    removeItem: vi.fn((key) => { delete localStorageMock.store[key]; }),
    clear: vi.fn(() => { localStorageMock.store = {}; }),
};
globalThis.localStorage = localStorageMock;

/**
 * Helper to create a store with the auth slice for testing.
 */
function createTestStore(preloadedState = {}) {
    return configureStore({
        reducer: { auth: authReducer },
        preloadedState: { auth: { authUser: null, isLoading: false, error: null, ...preloadedState } },
    });
}

describe('authSlice', () => {
    // ========== Reducers ==========

    describe('reducers', () => {
        it('should have correct initial state', () => {
            const store = createTestStore();
            const state = store.getState().auth;

            expect(state.authUser).toBeNull();
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });

        it('logout should clear authUser and error', () => {
            const store = createTestStore({
                authUser: { id: 'u1', email: 'test@test.com', token: 'abc' },
                error: 'some error',
            });

            store.dispatch(logout());
            const state = store.getState().auth;

            expect(state.authUser).toBeNull();
            expect(state.error).toBeNull();
        });

        it('setAuthError should set the error', () => {
            const store = createTestStore();

            store.dispatch(setAuthError('Login failed'));
            const state = store.getState().auth;

            expect(state.error).toBe('Login failed');
        });

        it('setLoading should update isLoading flag', () => {
            const store = createTestStore();

            store.dispatch(setLoading(true));
            expect(store.getState().auth.isLoading).toBe(true);

            store.dispatch(setLoading(false));
            expect(store.getState().auth.isLoading).toBe(false);
        });

        it('clearError should reset error to null', () => {
            const store = createTestStore({ error: 'something went wrong' });

            store.dispatch(clearError());

            expect(store.getState().auth.error).toBeNull();
        });
    });

    // ========== Async Thunk Lifecycle (via direct action dispatch) ==========

    describe('extraReducers - login lifecycle', () => {
        it('login.pending sets loading true and clears error', () => {
            const store = createTestStore({ error: 'old error' });

            store.dispatch({ type: 'auth/login/pending' });
            const state = store.getState().auth;

            expect(state.isLoading).toBe(true);
            expect(state.error).toBeNull();
        });

        it('login.fulfilled sets authUser from payload', () => {
            const store = createTestStore();
            const payload = { id: 'u1', email: 'test@test.com', isAdmin: false, token: 'jwt-token' };

            store.dispatch({ type: 'auth/login/fulfilled', payload });
            const state = store.getState().auth;

            expect(state.isLoading).toBe(false);
            expect(state.authUser).toEqual({
                id: 'u1',
                email: 'test@test.com',
                isAdmin: false,
                token: 'jwt-token',
            });
        });

        it('login.rejected sets error from payload', () => {
            const store = createTestStore();

            store.dispatch({ type: 'auth/login/rejected', payload: 'Invalid credentials' });
            const state = store.getState().auth;

            expect(state.isLoading).toBe(false);
            expect(state.error).toBe('Invalid credentials');
        });

        it('login.rejected uses fallback error when no payload', () => {
            const store = createTestStore();

            store.dispatch({ type: 'auth/login/rejected' });
            const state = store.getState().auth;

            expect(state.error).toBe('Login failed');
        });
    });

    describe('extraReducers - register lifecycle', () => {
        it('register.pending sets loading true', () => {
            const store = createTestStore();

            store.dispatch({ type: 'auth/register/pending' });

            expect(store.getState().auth.isLoading).toBe(true);
        });

        it('register.fulfilled sets authUser', () => {
            const store = createTestStore();
            const payload = { id: 'u2', email: 'new@test.com', isAdmin: false, token: 'new-jwt' };

            store.dispatch({ type: 'auth/register/fulfilled', payload });
            const state = store.getState().auth;

            expect(state.authUser.id).toBe('u2');
            expect(state.authUser.email).toBe('new@test.com');
        });

        it('register.rejected sets error', () => {
            const store = createTestStore();

            store.dispatch({ type: 'auth/register/rejected', payload: 'Email already taken' });

            expect(store.getState().auth.error).toBe('Email already taken');
        });
    });

    describe('extraReducers - restoreSession lifecycle', () => {
        it('restoreSession.pending sets loading true', () => {
            const store = createTestStore();

            store.dispatch({ type: 'auth/restoreSession/pending' });

            expect(store.getState().auth.isLoading).toBe(true);
        });

        it('restoreSession.fulfilled sets authUser', () => {
            const store = createTestStore();
            const payload = { id: 'u1', email: 'restored@test.com', isAdmin: true, token: 'restored-jwt' };

            store.dispatch({ type: 'auth/restoreSession/fulfilled', payload });
            const state = store.getState().auth;

            expect(state.authUser.id).toBe('u1');
            expect(state.authUser.isAdmin).toBe(true);
        });

        it('restoreSession.rejected clears authUser', () => {
            const store = createTestStore({
                authUser: { id: 'u1', email: 'test@test.com', token: 'old' },
            });

            store.dispatch({ type: 'auth/restoreSession/rejected' });
            const state = store.getState().auth;

            expect(state.authUser).toBeNull();
            expect(state.isLoading).toBe(false);
        });
    });
});
