/**
 * API Service Layer for Fitness Tracker
 * Connects frontend to Spring Boot backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Token management
const TOKEN_KEY = 'fitness_tracker_token';

export const tokenManager = {
    getToken: () => localStorage.getItem(TOKEN_KEY),
    setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
    removeToken: () => localStorage.removeItem(TOKEN_KEY),
};

/**
 * Base fetch wrapper with error handling and JWT support
 */
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = tokenManager.getToken();

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    };

    const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers }
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
        tokenManager.removeToken();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// Auth API
export const authApi = {
    login: async (email, password) => {
        const response = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (response.token) {
            tokenManager.setToken(response.token);
        }
        return response;
    },

    register: async (email, password, name) => {
        const response = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
        if (response.token) {
            tokenManager.setToken(response.token);
        }
        return response;
    },

    getCurrentUser: () => apiFetch('/auth/me'),

    logout: () => {
        tokenManager.removeToken();
    },

    forgotPassword: async (email) => {
        return apiFetch('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    resetPassword: async (token, newPassword) => {
        return apiFetch('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, newPassword }),
        });
    },
};

// Profile API
export const profileApi = {
    getProfiles: (userId) =>
        apiFetch(`/users/${userId}/profiles`),

    createProfile: (userId, profileData) =>
        apiFetch(`/users/${userId}/profiles`, {
            method: 'POST',
            body: JSON.stringify(profileData),
        }),

    updateProfile: (userId, profileId, profileData) =>
        apiFetch(`/users/${userId}/profiles/${profileId}`, {
            method: 'PUT',
            body: JSON.stringify(profileData),
        }),

    updateGoals: (userId, profileId, goals) =>
        apiFetch(`/users/${userId}/profiles/${profileId}/goals`, {
            method: 'PUT',
            body: JSON.stringify(goals),
        }),

    updateWaterIntake: (userId, profileId, waterIntake) =>
        apiFetch(`/users/${userId}/profiles/${profileId}/water`, {
            method: 'PUT',
            body: JSON.stringify({ waterIntake }),
        }),
};

// Food Log API
export const foodLogApi = {
    getTodayLog: (profileId) =>
        apiFetch(`/profiles/${profileId}/food-log`),

    getLogByDate: (profileId, date) =>
        apiFetch(`/profiles/${profileId}/food-log/${date}`),

    getLogsByRange: (profileId, startDate, endDate) =>
        apiFetch(`/profiles/${profileId}/food-log/range?start=${startDate}&end=${endDate}`),

    getAllLogs: (profileId) =>
        apiFetch(`/profiles/${profileId}/food-log/all`),

    addFoodItem: (profileId, foodItem) =>
        apiFetch(`/profiles/${profileId}/food-log`, {
            method: 'POST',
            body: JSON.stringify(foodItem),
        }),

    removeFoodItem: (profileId, itemId) =>
        apiFetch(`/profiles/${profileId}/food-log/${itemId}`, {
            method: 'DELETE',
        }),

    getTotals: (profileId) =>
        apiFetch(`/profiles/${profileId}/food-log/totals`),
};

// Workout Log API
export const workoutLogApi = {
    getTodayLog: (profileId) =>
        apiFetch(`/profiles/${profileId}/workout-log`),

    getLogByDate: (profileId, date) =>
        apiFetch(`/profiles/${profileId}/workout-log/${date}`),

    getLogsByRange: (profileId, startDate, endDate) =>
        apiFetch(`/profiles/${profileId}/workout-log/range?start=${startDate}&end=${endDate}`),

    getAllLogs: (profileId) =>
        apiFetch(`/profiles/${profileId}/workout-log/all`),

    addWorkout: (profileId, workout) =>
        apiFetch(`/profiles/${profileId}/workout-log`, {
            method: 'POST',
            body: JSON.stringify(workout),
        }),

    updateWorkout: (profileId, workoutId, workout) =>
        apiFetch(`/profiles/${profileId}/workout-log/${workoutId}`, {
            method: 'PUT',
            body: JSON.stringify(workout),
        }),

    removeWorkout: (profileId, workoutId) =>
        apiFetch(`/profiles/${profileId}/workout-log/${workoutId}`, {
            method: 'DELETE',
        }),

    getCaloriesBurned: (profileId) =>
        apiFetch(`/profiles/${profileId}/workout-log/calories-burned`),
};

// Food Database API
export const foodsApi = {
    getAll: (userId) =>
        apiFetch(`/foods${userId ? `?userId=${userId}` : ''}`),

    search: (query, userId) =>
        apiFetch(`/foods/search?q=${encodeURIComponent(query)}${userId ? `&userId=${userId}` : ''}`),

    getByCategory: (category, userId) =>
        apiFetch(`/foods/category/${category}${userId ? `?userId=${userId}` : ''}`),

    getByBarcode: (barcode) =>
        apiFetch(`/foods/barcode/${barcode}`),

    getCategories: () =>
        apiFetch('/foods/categories'),

    create: (food) =>
        apiFetch('/foods', {
            method: 'POST',
            body: JSON.stringify(food),
        }),

    update: (id, food) =>
        apiFetch(`/foods/${id}`, {
            method: 'PUT',
            body: JSON.stringify(food),
        }),

    delete: (id) =>
        apiFetch(`/foods/${id}`, {
            method: 'DELETE',
        }),
};

// Exercise Database API
export const exercisesApi = {
    /**
     * Get all exercises (with optional userId for custom exercises)
     */
    getAll: (userId) =>
        apiFetch(`/exercises${userId ? `?userId=${userId}` : ''}`),

    /**
     * Search exercises by name
     */
    search: (query, userId) =>
        apiFetch(`/exercises/search?q=${encodeURIComponent(query)}${userId ? `&userId=${userId}` : ''}`),

    /**
     * Get exercises by category
     */
    getByCategory: (category, userId) =>
        apiFetch(`/exercises/category/${category}${userId ? `?userId=${userId}` : ''}`),

    /**
     * Get all categories
     */
    getCategories: () =>
        apiFetch('/exercises/categories'),

    /**
     * Create a new exercise (custom or admin)
     */
    create: (exercise) =>
        apiFetch('/exercises', {
            method: 'POST',
            body: JSON.stringify(exercise),
        }),

    /**
     * Update an exercise
     */
    update: (id, exercise) =>
        apiFetch(`/exercises/${id}`, {
            method: 'PUT',
            body: JSON.stringify(exercise),
        }),

    /**
     * Delete an exercise
     */
    delete: (id) =>
        apiFetch(`/exercises/${id}`, {
            method: 'DELETE',
        }),
};

export default {
    auth: authApi,
    profile: profileApi,
    foodLog: foodLogApi,
    workoutLog: workoutLogApi,
    foods: foodsApi,
    exercises: exercisesApi,
};

