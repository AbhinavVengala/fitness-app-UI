import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, tokenManager } from '../../api';
import { setActiveProfileId, loadUserProfiles, setUserId } from './profileSlice';

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { dispatch, rejectWithValue }) => {
    const token = tokenManager.getToken();
    if (!token) {
      return rejectWithValue('No token found');
    }

    try {
      const response = await authApi.getCurrentUser();

      dispatch(setUserId(response.id));
      dispatch(loadUserProfiles(response.profiles || []));

      if (response.profiles && response.profiles.length > 0) {
        dispatch(setActiveProfileId(response.profiles[0].id));
      }

      return response;
    } catch (error) {
      tokenManager.removeToken();
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const response = await authApi.login(email, password);

      dispatch(setUserId(response.id));
      dispatch(loadUserProfiles(response.profiles || []));

      if (response.profiles && response.profiles.length > 0) {
        dispatch(setActiveProfileId(response.profiles[0].id));
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, name }, { dispatch, rejectWithValue }) => {
    try {
      const response = await authApi.register(email, password, name);

      dispatch(setUserId(response.id));
      dispatch(loadUserProfiles(response.profiles || []));

      if (response.profiles && response.profiles.length > 0) {
        dispatch(setActiveProfileId(response.profiles[0].id));
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    authUser: null,  // { id, email, isAdmin, token }
    isLoading: true,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.authUser = null;
      state.error = null;
      tokenManager.removeToken();
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Restore Session
      .addCase(restoreSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.authUser = {
          id: action.payload.id,
          email: action.payload.email,
          isAdmin: action.payload.isAdmin || false,
          token: action.payload.token,
        };
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isLoading = false;
        state.authUser = null;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.authUser = {
          id: action.payload.id,
          email: action.payload.email,
          isAdmin: action.payload.isAdmin || false,
          token: action.payload.token,
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.authUser = {
          id: action.payload.id,
          email: action.payload.email,
          isAdmin: action.payload.isAdmin || false,
          token: action.payload.token,
        };
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      });
  },
});

export const { logout, setAuthError, setLoading, clearError } = authSlice.actions;
export default authSlice.reducer;

