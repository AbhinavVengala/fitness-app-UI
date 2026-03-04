import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import profileReducer, {
    setUserId,
    loadUserProfiles,
    setActiveProfileId,
    setSelectedRestaurantId,
    updateProfileInStore,
    setPage,
    resetProfile,
    selectActiveProfile,
    selectSelectedRestaurantId,
    selectUserId,
} from './profileSlice';

/**
 * Helper to create a store with the profile slice for testing.
 */
function createTestStore(preloadedState = {}) {
    return configureStore({
        reducer: { profile: profileReducer },
        preloadedState: {
            profile: {
                userId: null,
                userProfiles: [],
                activeProfileId: null,
                selectedRestaurantId: null,
                page: 'dashboard',
                ...preloadedState,
            },
        },
    });
}

describe('profileSlice', () => {
    // ========== Reducers ==========

    describe('reducers', () => {
        it('should have correct initial state', () => {
            const store = createTestStore();
            const state = store.getState().profile;

            expect(state.userId).toBeNull();
            expect(state.userProfiles).toEqual([]);
            expect(state.activeProfileId).toBeNull();
            expect(state.selectedRestaurantId).toBeNull();
            expect(state.page).toBe('dashboard');
        });

        it('setUserId should set the userId', () => {
            const store = createTestStore();

            store.dispatch(setUserId('user-123'));

            expect(store.getState().profile.userId).toBe('user-123');
        });

        it('loadUserProfiles should set profiles array', () => {
            const store = createTestStore();
            const profiles = [
                { id: 'p1', name: 'John' },
                { id: 'p2', name: 'Jane' },
            ];

            store.dispatch(loadUserProfiles(profiles));

            expect(store.getState().profile.userProfiles).toHaveLength(2);
            expect(store.getState().profile.userProfiles[0].name).toBe('John');
        });

        it('setActiveProfileId should set the active profile', () => {
            const store = createTestStore();

            store.dispatch(setActiveProfileId('p1'));

            expect(store.getState().profile.activeProfileId).toBe('p1');
        });

        it('setSelectedRestaurantId should set restaurant ID', () => {
            const store = createTestStore();

            store.dispatch(setSelectedRestaurantId('rest-42'));

            expect(store.getState().profile.selectedRestaurantId).toBe('rest-42');
        });

        it('updateProfileInStore should update matching profile', () => {
            const store = createTestStore({
                userProfiles: [
                    { id: 'p1', name: 'John', age: 25 },
                    { id: 'p2', name: 'Jane', age: 30 },
                ],
            });

            store.dispatch(updateProfileInStore({
                profileId: 'p1',
                updates: { age: 26, weight: 80 },
            }));

            const profiles = store.getState().profile.userProfiles;
            expect(profiles[0].age).toBe(26);
            expect(profiles[0].weight).toBe(80);
            expect(profiles[0].name).toBe('John'); // other fields preserved
            expect(profiles[1].age).toBe(30); // other profiles untouched
        });

        it('updateProfileInStore with non-matching ID does not change anything', () => {
            const store = createTestStore({
                userProfiles: [{ id: 'p1', name: 'John' }],
            });

            store.dispatch(updateProfileInStore({
                profileId: 'nonexistent',
                updates: { name: 'Changed' },
            }));

            expect(store.getState().profile.userProfiles[0].name).toBe('John');
        });

        it('setPage should update current page', () => {
            const store = createTestStore();

            store.dispatch(setPage('settings'));

            expect(store.getState().profile.page).toBe('settings');
        });

        it('resetProfile should reset all state to defaults', () => {
            const store = createTestStore({
                userId: 'u1',
                userProfiles: [{ id: 'p1' }],
                activeProfileId: 'p1',
                selectedRestaurantId: 'r1',
                page: 'settings',
            });

            store.dispatch(resetProfile());
            const state = store.getState().profile;

            expect(state.userId).toBeNull();
            expect(state.userProfiles).toEqual([]);
            expect(state.activeProfileId).toBeNull();
            expect(state.selectedRestaurantId).toBeNull();
            expect(state.page).toBe('dashboard');
        });
    });

    // ========== Selectors ==========

    describe('selectors', () => {
        it('selectActiveProfile returns the active profile', () => {
            const store = createTestStore({
                userProfiles: [
                    { id: 'p1', name: 'John' },
                    { id: 'p2', name: 'Jane' },
                ],
                activeProfileId: 'p2',
            });

            const activeProfile = selectActiveProfile(store.getState());

            expect(activeProfile).not.toBeNull();
            expect(activeProfile.name).toBe('Jane');
        });

        it('selectActiveProfile returns null when no active ID', () => {
            const store = createTestStore({
                userProfiles: [{ id: 'p1', name: 'John' }],
                activeProfileId: null,
            });

            expect(selectActiveProfile(store.getState())).toBeNull();
        });

        it('selectActiveProfile returns undefined when ID does not match any profile', () => {
            const store = createTestStore({
                userProfiles: [{ id: 'p1', name: 'John' }],
                activeProfileId: 'nonexistent',
            });

            expect(selectActiveProfile(store.getState())).toBeUndefined();
        });

        it('selectSelectedRestaurantId returns the restaurant ID', () => {
            const store = createTestStore({ selectedRestaurantId: 'r42' });

            expect(selectSelectedRestaurantId(store.getState())).toBe('r42');
        });

        it('selectUserId returns the userId', () => {
            const store = createTestStore({ userId: 'u-abc' });

            expect(selectUserId(store.getState())).toBe('u-abc');
        });

        it('selectUserId returns null when no userId set', () => {
            const store = createTestStore();

            expect(selectUserId(store.getState())).toBeNull();
        });
    });
});
