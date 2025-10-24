
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockDatabase } from '../../data/database';
import { setActiveProfileId, loadUserProfiles } from './profileSlice';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockDatabase.users[email];
        if (user && user.password === password) {
          const profiles = Object.values(user.profiles || {});
          dispatch(loadUserProfiles(profiles));
          if (profiles.length > 0) {
            dispatch(setActiveProfileId(profiles[0].id));
          }
          resolve(email);
        } else {
          reject(new Error("Invalid email or password."));
        }
      }, 500);
    });
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    authUser: null,
    isLoading: true,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.authUser = null;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { logout, setAuthError, setLoading } = authSlice.actions;
export default authSlice.reducer;
