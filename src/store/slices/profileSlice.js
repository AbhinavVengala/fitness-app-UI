import { createSlice } from '@reduxjs/toolkit';

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    userProfiles: [],
    activeProfileId: null,
    page: 'dashboard',
  },
  reducers: {
    loadUserProfiles: (state, action) => {
      state.userProfiles = action.payload;
    },
    setActiveProfileId: (state, action) => {
      state.activeProfileId = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    resetProfile: (state) => {
        state.userProfiles = [];
        state.activeProfileId = null;
    }
  },
});

export const { loadUserProfiles, setActiveProfileId, setPage, resetProfile } = profileSlice.actions;

export const selectActiveProfile = (state) => {
    const { activeProfileId, userProfiles } = state.profile;
    if (!activeProfileId || !userProfiles) return null;
    return userProfiles.find(p => p.id === activeProfileId);
}

export default profileSlice.reducer;
