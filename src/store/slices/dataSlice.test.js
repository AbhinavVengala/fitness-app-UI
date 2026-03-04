import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import dataReducer, {
    loadDataFromProfile,
    setGoals,
    setWaterIntake,
    clearError,
    resetData,
    selectDailyTotals,
} from './dataSlice';

/**
 * Helper to create a store with the data slice for testing.
 */
function createTestStore(preloadedState = {}) {
    return configureStore({
        reducer: { data: dataReducer },
        preloadedState: {
            data: {
                foodLog: [],
                workoutLog: [],
                goals: {},
                waterIntake: 0,
                isLoading: false,
                error: null,
                ...preloadedState,
            },
        },
    });
}

describe('dataSlice', () => {
    // ========== Reducers ==========

    describe('reducers', () => {
        it('should have correct initial state', () => {
            const store = createTestStore();
            const state = store.getState().data;

            expect(state.foodLog).toEqual([]);
            expect(state.workoutLog).toEqual([]);
            expect(state.goals).toEqual({});
            expect(state.waterIntake).toBe(0);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });

        it('loadDataFromProfile should load all data fields', () => {
            const store = createTestStore();
            const payload = {
                foodLog: [{ name: 'Banana', calories: 105 }],
                workoutLog: [{ name: 'Push Ups', caloriesBurned: 50 }],
                goals: { calories: 2000, protein: 100 },
                waterIntake: 5,
            };

            store.dispatch(loadDataFromProfile(payload));
            const state = store.getState().data;

            expect(state.foodLog).toHaveLength(1);
            expect(state.foodLog[0].name).toBe('Banana');
            expect(state.workoutLog).toHaveLength(1);
            expect(state.goals.calories).toBe(2000);
            expect(state.waterIntake).toBe(5);
        });

        it('loadDataFromProfile with missing fields defaults to empty', () => {
            const store = createTestStore();

            store.dispatch(loadDataFromProfile({}));
            const state = store.getState().data;

            expect(state.foodLog).toEqual([]);
            expect(state.workoutLog).toEqual([]);
            expect(state.goals).toEqual({});
            expect(state.waterIntake).toBe(0);
        });

        it('setGoals should set the goals object', () => {
            const store = createTestStore();
            const goals = { calories: 2500, protein: 150, carbs: 250, fats: 80, water: 10 };

            store.dispatch(setGoals(goals));

            expect(store.getState().data.goals).toEqual(goals);
        });

        it('setWaterIntake should set the water intake value', () => {
            const store = createTestStore();

            store.dispatch(setWaterIntake(7));

            expect(store.getState().data.waterIntake).toBe(7);
        });

        it('clearError should reset error to null', () => {
            const store = createTestStore({ error: 'some error' });

            store.dispatch(clearError());

            expect(store.getState().data.error).toBeNull();
        });

        it('resetData should reset all state to defaults', () => {
            const store = createTestStore({
                foodLog: [{ name: 'Item' }],
                workoutLog: [{ name: 'Exercise' }],
                goals: { calories: 2000 },
                waterIntake: 5,
                error: 'old error',
            });

            store.dispatch(resetData());
            const state = store.getState().data;

            expect(state.foodLog).toEqual([]);
            expect(state.workoutLog).toEqual([]);
            expect(state.goals).toEqual({});
            expect(state.waterIntake).toBe(0);
            expect(state.error).toBeNull();
        });
    });

    // ========== Async Thunk Lifecycle ==========

    describe('extraReducers - fetchTodayData lifecycle', () => {
        it('fetchTodayData.pending sets loading true', () => {
            const store = createTestStore();

            store.dispatch({ type: 'data/fetchToday/pending' });

            expect(store.getState().data.isLoading).toBe(true);
            expect(store.getState().data.error).toBeNull();
        });

        it('fetchTodayData.fulfilled sets food and workout logs', () => {
            const store = createTestStore();
            const payload = {
                foodLog: [{ name: 'Apple', calories: 95 }],
                workoutLog: [{ name: 'Running', caloriesBurned: 300 }],
            };

            store.dispatch({ type: 'data/fetchToday/fulfilled', payload });
            const state = store.getState().data;

            expect(state.isLoading).toBe(false);
            expect(state.foodLog).toHaveLength(1);
            expect(state.workoutLog).toHaveLength(1);
        });

        it('fetchTodayData.rejected sets error', () => {
            const store = createTestStore();

            store.dispatch({ type: 'data/fetchToday/rejected', payload: 'Network error' });

            expect(store.getState().data.isLoading).toBe(false);
            expect(store.getState().data.error).toBe('Network error');
        });
    });

    describe('extraReducers - food actions', () => {
        it('addFoodAsync.fulfilled replaces foodLog', () => {
            const store = createTestStore({ foodLog: [{ name: 'Old' }] });
            const newItems = [{ name: 'New1' }, { name: 'New2' }];

            store.dispatch({ type: 'data/addFood/fulfilled', payload: newItems });

            expect(store.getState().data.foodLog).toEqual(newItems);
        });

        it('removeFoodAsync.fulfilled replaces foodLog', () => {
            const store = createTestStore({
                foodLog: [{ name: 'Item1' }, { name: 'Item2' }],
            });

            store.dispatch({ type: 'data/removeFood/fulfilled', payload: [{ name: 'Item2' }] });

            expect(store.getState().data.foodLog).toHaveLength(1);
        });
    });

    describe('extraReducers - workout actions', () => {
        it('addWorkoutAsync.fulfilled replaces workoutLog', () => {
            const store = createTestStore();
            const workouts = [{ name: 'Push Ups' }];

            store.dispatch({ type: 'data/addWorkout/fulfilled', payload: workouts });

            expect(store.getState().data.workoutLog).toEqual(workouts);
        });

        it('updateWorkoutAsync.fulfilled replaces workoutLog', () => {
            const store = createTestStore();
            const updated = [{ name: 'Updated' }];

            store.dispatch({ type: 'data/updateWorkout/fulfilled', payload: updated });

            expect(store.getState().data.workoutLog).toEqual(updated);
        });

        it('removeWorkoutAsync.fulfilled replaces workoutLog', () => {
            const store = createTestStore({ workoutLog: [{ name: 'W1' }, { name: 'W2' }] });

            store.dispatch({ type: 'data/removeWorkout/fulfilled', payload: [{ name: 'W2' }] });

            expect(store.getState().data.workoutLog).toHaveLength(1);
        });
    });

    describe('extraReducers - goals and water', () => {
        it('updateGoalsAsync.fulfilled sets goals', () => {
            const store = createTestStore();
            const goals = { calories: 2000, protein: 100 };

            store.dispatch({ type: 'data/updateGoals/fulfilled', payload: goals });

            expect(store.getState().data.goals).toEqual(goals);
        });

        it('updateWaterAsync.fulfilled sets waterIntake', () => {
            const store = createTestStore();

            store.dispatch({ type: 'data/updateWater/fulfilled', payload: 6 });

            expect(store.getState().data.waterIntake).toBe(6);
        });
    });

    // ========== Selectors ==========

    describe('selectDailyTotals', () => {
        it('computes correct totals from food and workout logs', () => {
            const store = createTestStore({
                foodLog: [
                    { calories: 300, protein: 30, carbs: 40, fats: 10 },
                    { calories: 200, protein: 20, carbs: 25, fats: 8 },
                ],
                workoutLog: [
                    { caloriesBurned: 150 },
                    { caloriesBurned: 100 },
                ],
                waterIntake: 6,
            });

            const totals = selectDailyTotals(store.getState());

            expect(totals.calories).toBe(500);
            expect(totals.protein).toBe(50);
            expect(totals.carbs).toBe(65);
            expect(totals.fats).toBe(18);
            expect(totals.caloriesBurned).toBe(250);
            expect(totals.water).toBe(6);
        });

        it('returns zeros for empty logs', () => {
            const store = createTestStore();
            const totals = selectDailyTotals(store.getState());

            expect(totals.calories).toBe(0);
            expect(totals.protein).toBe(0);
            expect(totals.carbs).toBe(0);
            expect(totals.fats).toBe(0);
            expect(totals.caloriesBurned).toBe(0);
            expect(totals.water).toBe(0);
        });

        it('handles missing nutrient fields gracefully', () => {
            const store = createTestStore({
                foodLog: [{ calories: 100 }], // no protein/carbs/fats
                workoutLog: [{}], // no caloriesBurned
            });

            const totals = selectDailyTotals(store.getState());

            expect(totals.calories).toBe(100);
            expect(totals.protein).toBe(0);
            expect(totals.caloriesBurned).toBe(0);
        });
    });
});
