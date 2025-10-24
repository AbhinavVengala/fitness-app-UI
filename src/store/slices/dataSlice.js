
import { createSlice } from '@reduxjs/toolkit';
import { mockDatabase } from '../../data/database';

const updateUserProfileData = (email, profileId, newProfileData) => {
    if (mockDatabase.users[email] && mockDatabase.users[email].profiles[profileId]) {
        mockDatabase.users[email].profiles[profileId] = {
            ...mockDatabase.users[email].profiles[profileId],
            ...newProfileData,
        };
    }
};

const dataSlice = createSlice({
  name: 'data',
  initialState: {
    foodLog: [],
    workoutLog: [],
    goals: {},
    waterIntake: 0,
  },
  reducers: {
    loadDataFromProfile: (state, action) => {
      const { foodLog, workoutLog, goals, waterIntake } = action.payload;
      state.foodLog = foodLog || [];
      state.workoutLog = workoutLog || [];
      state.goals = goals || {};
      state.waterIntake = waterIntake || 0;
    },
    addFood: (state, action) => {
      const { authUser, profileId, food } = action.payload;
      const newFood = { ...food, id: Date.now() };
      state.foodLog.push(newFood);
      updateUserProfileData(authUser, profileId, { foodLog: state.foodLog });
    },
    removeFood: (state, action) => {
      const { authUser, profileId, foodId } = action.payload;
      state.foodLog = state.foodLog.filter(f => f.id !== foodId);
      updateUserProfileData(authUser, profileId, { foodLog: state.foodLog });
    },
    addWorkout: (state, action) => {
        const { authUser, profileId, workout } = action.payload;
        state.workoutLog.push(workout);
        updateUserProfileData(authUser, profileId, { workoutLog: state.workoutLog });
    },
    updateWorkout: (state, action) => {
        const { authUser, profileId, workoutId, updatedData } = action.payload;
        state.workoutLog = state.workoutLog.map(w => w.id === workoutId ? { ...w, ...updatedData } : w);
        updateUserProfileData(authUser, profileId, { workoutLog: state.workoutLog });
    },
    removeWorkout: (state, action) => {
        const { authUser, profileId, workoutId } = action.payload;
        state.workoutLog = state.workoutLog.filter(w => w.id !== workoutId);
        updateUserProfileData(authUser, profileId, { workoutLog: state.workoutLog });
    },
    updateProfileDetails: (state, action) => {
        const { authUser, profileId, newDetails } = action.payload;
        updateUserProfileData(authUser, profileId, newDetails);
    },
    updateGoals: (state, action) => {
        const { authUser, profileId, newGoals } = action.payload;
        state.goals = newGoals;
        updateUserProfileData(authUser, profileId, { goals: newGoals });
    },
    updateWater: (state, action) => {
        const { authUser, profileId, newIntake } = action.payload;
        state.waterIntake = newIntake;
        updateUserProfileData(authUser, profileId, { waterIntake: newIntake });
    },
  },
});

export const { loadDataFromProfile, addFood, removeFood, addWorkout, updateWorkout, removeWorkout, updateProfileDetails, updateGoals, updateWater } = dataSlice.actions;

export const selectDailyTotals = (state) => {
    const { foodLog, workoutLog } = state.data;
    return {
        calories: foodLog.reduce((sum, item) => sum + item.calories, 0),
        protein: foodLog.reduce((sum, item) => sum + item.protein, 0),
        carbs: foodLog.reduce((sum, item) => sum + item.carbs, 0),
        fats: foodLog.reduce((sum, item) => sum + item.fats, 0),
        caloriesBurned: workoutLog.reduce((sum, item) => sum + item.caloriesBurned, 0),
    }
}

export default dataSlice.reducer;
