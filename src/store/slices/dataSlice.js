import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { foodLogApi, workoutLogApi, profileApi } from '../../api';

// ============== ASYNC THUNKS ==============

/**
 * Fetch today's data from API
 */
export const fetchTodayData = createAsyncThunk(
  'data/fetchToday',
  async (profileId, { rejectWithValue }) => {
    try {
      const [foodLogResponse, workoutLogResponse] = await Promise.all([
        foodLogApi.getTodayLog(profileId),
        workoutLogApi.getTodayLog(profileId),
      ]);

      return {
        foodLog: foodLogResponse.items || [],
        workoutLog: workoutLogResponse.workouts || [],
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Add food item via API
 */
export const addFoodAsync = createAsyncThunk(
  'data/addFood',
  async ({ profileId, food }, { rejectWithValue }) => {
    try {
      const response = await foodLogApi.addFoodItem(profileId, food);
      return response.items || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Remove food item via API
 */
export const removeFoodAsync = createAsyncThunk(
  'data/removeFood',
  async ({ profileId, foodId }, { rejectWithValue }) => {
    try {
      const response = await foodLogApi.removeFoodItem(profileId, foodId);
      return response.items || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Add/update workout via API
 */
export const addWorkoutAsync = createAsyncThunk(
  'data/addWorkout',
  async ({ profileId, workout }, { rejectWithValue }) => {
    try {
      const response = await workoutLogApi.addWorkout(profileId, workout);
      return response.workouts || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update workout via API
 */
export const updateWorkoutAsync = createAsyncThunk(
  'data/updateWorkout',
  async ({ profileId, workoutId, workout }, { rejectWithValue }) => {
    try {
      const response = await workoutLogApi.updateWorkout(profileId, workoutId, workout);
      return response.workouts || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Remove workout via API
 */
export const removeWorkoutAsync = createAsyncThunk(
  'data/removeWorkout',
  async ({ profileId, workoutId }, { rejectWithValue }) => {
    try {
      const response = await workoutLogApi.removeWorkout(profileId, workoutId);
      return response.workouts || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update goals via API
 */
export const updateGoalsAsync = createAsyncThunk(
  'data/updateGoals',
  async ({ userId, profileId, goals }, { rejectWithValue }) => {
    try {
      const response = await profileApi.updateGoals(userId, profileId, goals);
      return response.goals;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update water intake via API
 */
export const updateWaterAsync = createAsyncThunk(
  'data/updateWater',
  async ({ userId, profileId, waterIntake }, { rejectWithValue }) => {
    try {
      const response = await profileApi.updateWaterIntake(userId, profileId, waterIntake);
      return response.waterIntake;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ============== SLICE ==============

const dataSlice = createSlice({
  name: 'data',
  initialState: {
    foodLog: [],
    workoutLog: [],
    goals: {},
    waterIntake: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    loadDataFromProfile: (state, action) => {
      const { foodLog, workoutLog, goals, waterIntake } = action.payload;
      state.foodLog = foodLog || [];
      state.workoutLog = workoutLog || [];
      state.goals = goals || {};
      state.waterIntake = waterIntake || 0;
    },
    setGoals: (state, action) => {
      state.goals = action.payload;
    },
    setWaterIntake: (state, action) => {
      state.waterIntake = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetData: (state) => {
      state.foodLog = [];
      state.workoutLog = [];
      state.goals = {};
      state.waterIntake = 0;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch today data
      .addCase(fetchTodayData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodayData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.foodLog = action.payload.foodLog;
        state.workoutLog = action.payload.workoutLog;
      })
      .addCase(fetchTodayData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add food
      .addCase(addFoodAsync.fulfilled, (state, action) => {
        state.foodLog = action.payload;
      })
      .addCase(addFoodAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove food
      .addCase(removeFoodAsync.fulfilled, (state, action) => {
        state.foodLog = action.payload;
      })
      // Add workout
      .addCase(addWorkoutAsync.fulfilled, (state, action) => {
        state.workoutLog = action.payload;
      })
      // Update workout
      .addCase(updateWorkoutAsync.fulfilled, (state, action) => {
        state.workoutLog = action.payload;
      })
      // Remove workout
      .addCase(removeWorkoutAsync.fulfilled, (state, action) => {
        state.workoutLog = action.payload;
      })
      // Update goals
      .addCase(updateGoalsAsync.fulfilled, (state, action) => {
        state.goals = action.payload;
      })
      // Update water
      .addCase(updateWaterAsync.fulfilled, (state, action) => {
        state.waterIntake = action.payload;
      });
  },
});

export const {
  loadDataFromProfile,
  setGoals,
  setWaterIntake,
  clearError,
  resetData
} = dataSlice.actions;

// Selectors
export const selectDailyTotals = (state) => {
  const { foodLog, workoutLog } = state.data;
  return {
    calories: foodLog.reduce((sum, item) => sum + (item.calories || 0), 0),
    protein: foodLog.reduce((sum, item) => sum + (item.protein || 0), 0),
    carbs: foodLog.reduce((sum, item) => sum + (item.carbs || 0), 0),
    fats: foodLog.reduce((sum, item) => sum + (item.fats || 0), 0),
    caloriesBurned: workoutLog.reduce((sum, item) => sum + (item.caloriesBurned || 0), 0),
  };
};

export default dataSlice.reducer;
