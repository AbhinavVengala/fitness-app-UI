import { createSlice } from '@reduxjs/toolkit';

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    userId: null,           // Backend user ID
    userProfiles: [],       // Array of profiles
    activeProfileId: null,  // Currently selected profile ID
    page: 'dashboard',      // Current page
  },
  reducers: {
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    loadUserProfiles: (state, action) => {
      state.userProfiles = action.payload;
    },
    setActiveProfileId: (state, action) => {
      state.activeProfileId = action.payload;
    },
    updateProfileInStore: (state, action) => {
      const { profileId, updates } = action.payload;
      state.userProfiles = state.userProfiles.map(p =>
        p.id === profileId ? { ...p, ...updates } : p
      );
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    resetProfile: (state) => {
      state.userId = null;
      state.userProfiles = [];
      state.activeProfileId = null;
      state.page = 'dashboard';
    }
  },
});

export const {
  setUserId,
  loadUserProfiles,
  setActiveProfileId,
  updateProfileInStore,
  setPage,
  resetProfile
} = profileSlice.actions;

export const selectActiveProfile = (state) => {
  const { activeProfileId, userProfiles } = state.profile;
  if (!activeProfileId || !userProfiles) return null;
  return userProfiles.find(p => p.id === activeProfileId);
};

export const selectUserId = (state) => state.profile.userId;

export default profileSlice.reducer;
