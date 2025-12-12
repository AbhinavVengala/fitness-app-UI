/**
 * API Service Layer for Fitness Tracker
 * Connects frontend to Spring Boot backend
 */

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// ============== AUTH API ==============

export const authApi = {
    /**
     * Login with email and password
     */
    login: (email, password) =>
        apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    /**
     * Register a new user
     */
    register: (email, password, name) =>
        apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        }),
};

// ============== PROFILE API ==============

export const profileApi = {
    /**
     * Get all profiles for a user
     */
    getProfiles: (userId) =>
        apiFetch(`/users/${userId}/profiles`),

    /**
     * Create a new profile
     */
    createProfile: (userId, profileData) =>
        apiFetch(`/users/${userId}/profiles`, {
            method: 'POST',
            body: JSON.stringify(profileData),
        }),

    /**
     * Update a profile
     */
    updateProfile: (userId, profileId, profileData) =>
        apiFetch(`/users/${userId}/profiles/${profileId}`, {
            method: 'PUT',
            body: JSON.stringify(profileData),
        }),

    /**
     * Update goals for a profile
     */
    updateGoals: (userId, profileId, goals) =>
        apiFetch(`/users/${userId}/profiles/${profileId}/goals`, {
            method: 'PUT',
            body: JSON.stringify(goals),
        }),

    /**
     * Update water intake
     */
    updateWaterIntake: (userId, profileId, waterIntake) =>
        apiFetch(`/users/${userId}/profiles/${profileId}/water`, {
            method: 'PUT',
            body: JSON.stringify({ waterIntake }),
        }),
};

// ============== FOOD LOG API ==============

export const foodLogApi = {
    /**
     * Get today's food log
     */
    getTodayLog: (profileId) =>
        apiFetch(`/profiles/${profileId}/food-log`),

    /**
     * Get food log by specific date
     */
    getLogByDate: (profileId, date) =>
        apiFetch(`/profiles/${profileId}/food-log/${date}`),

    /**
     * Get food logs for date range
     */
    getLogsByRange: (profileId, startDate, endDate) =>
        apiFetch(`/profiles/${profileId}/food-log/range?start=${startDate}&end=${endDate}`),

    /**
     * Get all food logs for a profile
     */
    getAllLogs: (profileId) =>
        apiFetch(`/profiles/${profileId}/food-log/all`),

    /**
     * Add a food item to today's log
     */
    addFoodItem: (profileId, foodItem) =>
        apiFetch(`/profiles/${profileId}/food-log`, {
            method: 'POST',
            body: JSON.stringify(foodItem),
        }),

    /**
     * Remove a food item from today's log
     */
    removeFoodItem: (profileId, itemId) =>
        apiFetch(`/profiles/${profileId}/food-log/${itemId}`, {
            method: 'DELETE',
        }),

    /**
     * Get daily totals
     */
    getTotals: (profileId) =>
        apiFetch(`/profiles/${profileId}/food-log/totals`),
};

// ============== WORKOUT LOG API ==============

export const workoutLogApi = {
    /**
     * Get today's workout log
     */
    getTodayLog: (profileId) =>
        apiFetch(`/profiles/${profileId}/workout-log`),

    /**
     * Get workout log by specific date
     */
    getLogByDate: (profileId, date) =>
        apiFetch(`/profiles/${profileId}/workout-log/${date}`),

    /**
     * Get workout logs for date range
     */
    getLogsByRange: (profileId, startDate, endDate) =>
        apiFetch(`/profiles/${profileId}/workout-log/range?start=${startDate}&end=${endDate}`),

    /**
     * Get all workout logs for a profile
     */
    getAllLogs: (profileId) =>
        apiFetch(`/profiles/${profileId}/workout-log/all`),

    /**
     * Add a workout entry
     */
    addWorkout: (profileId, workout) =>
        apiFetch(`/profiles/${profileId}/workout-log`, {
            method: 'POST',
            body: JSON.stringify(workout),
        }),

    /**
     * Update a workout entry
     */
    updateWorkout: (profileId, workoutId, workout) =>
        apiFetch(`/profiles/${profileId}/workout-log/${workoutId}`, {
            method: 'PUT',
            body: JSON.stringify(workout),
        }),

    /**
     * Remove a workout entry
     */
    removeWorkout: (profileId, workoutId) =>
        apiFetch(`/profiles/${profileId}/workout-log/${workoutId}`, {
            method: 'DELETE',
        }),

    /**
     * Get calories burned today
     */
    getCaloriesBurned: (profileId) =>
        apiFetch(`/profiles/${profileId}/workout-log/calories-burned`),
};

// ============== FOOD DATABASE API ==============

export const foodsApi = {
    /**
     * Get all foods (with optional userId for custom foods)
     */
    getAll: (userId) =>
        apiFetch(`/foods${userId ? `?userId=${userId}` : ''}`),

    /**
     * Search foods by name
     */
    search: (query, userId) =>
        apiFetch(`/foods/search?q=${encodeURIComponent(query)}${userId ? `&userId=${userId}` : ''}`),

    /**
     * Get foods by category
     */
    getByCategory: (category, userId) =>
        apiFetch(`/foods/category/${category}${userId ? `?userId=${userId}` : ''}`),

    /**
     * Get all categories
     */
    getCategories: () =>
        apiFetch('/foods/categories'),

    /**
     * Create a new food (custom or admin)
     */
    create: (food) =>
        apiFetch('/foods', {
            method: 'POST',
            body: JSON.stringify(food),
        }),

    /**
     * Update a food
     */
    update: (id, food) =>
        apiFetch(`/foods/${id}`, {
            method: 'PUT',
            body: JSON.stringify(food),
        }),

    /**
     * Delete a food
     */
    delete: (id) =>
        apiFetch(`/foods/${id}`, {
            method: 'DELETE',
        }),
};

// ============== EXERCISE DATABASE API ==============

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

