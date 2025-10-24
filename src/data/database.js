
// --- MOCK DATABASE ---
// This object simulates a simple database for a multi-user MVP.
// Data will reset on page refresh.
export const mockDatabase = {
  users: {
    "user@example.com": {
      password: "password123",
      profiles: {
        "profile1": {
          id: "profile1",
          name: "Alex", age: 30, weight: 75, height: 180, gender: 'male',
          fitnessGoal: 'generalFitness', experienceLevel: 'beginner',
          goals: { calories: 2366, protein: 120, carbs: 266, fats: 66, water: 8 },
          waterIntake: 4,
          foodLog: [{ id: 1, name: 'Roti / Chapati', calories: 85, protein: 3, carbs: 15, fats: 1.5, meal: 'lunch' }],
          workoutLog: [],
        },
        "profile2": {
          id: "profile2",
          name: "Jordan", age: 28, weight: 65, height: 165, gender: 'female',
          fitnessGoal: 'weightLoss', experienceLevel: 'intermediate',
          goals: { calories: 1950, protein: 104, carbs: 219, fats: 54, water: 8 },
          waterIntake: 2,
          foodLog: [],
          workoutLog: [],
        }
      }
    }
  }
};

// --- BUILT-IN DATABASES ---
export const indianFoodDatabase = [
    { name: 'Roti / Chapati (1 medium)', calories: 85, protein: 3, carbs: 15, fats: 1.5 },
    { name: 'Plain Dosa (1 medium)', calories: 120, protein: 3, carbs: 25, fats: 2 },
    { name: 'Idli (1 piece)', calories: 40, protein: 1, carbs: 8, fats: 0.2 },
];
export const generalFoodDatabase = [
    { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
    { name: 'Chicken Breast (100g grilled)', calories: 165, protein: 31, carbs: 3.6 },
    { name: 'Oats (1/2 cup dry)', calories: 150, protein: 5, carbs: 27, fats: 2.5 },
];
export const combinedFoodDatabase = [...indianFoodDatabase, ...generalFoodDatabase];
export const exercises = {
    'Jumping Jacks': { type: 'duration', met: 8.0, category: 'home' },
    'Push-ups': { type: 'reps', caloriesPerRep: 0.8, category: 'home' },
    'Squats': { type: 'reps', caloriesPerRep: 0.6, category: 'home' },
    'Bench Press': { type: 'reps', caloriesPerRep: 1.2, category: 'gym' },
    'Deadlift': { type: 'reps', caloriesPerRep: 1.8, category: 'gym' },
    'Running': { type: 'duration', met: 9.8, category: 'sports' },
    'Cycling': { type: 'duration', met: 7.5, category: 'sports' },
};
export const workoutPlans = {
    beginner: {
        generalFitness: {
            home: [{ name: 'Jumping Jacks', reps: [180], unit: 'seconds' }, { name: 'Squats', reps: [12, 12, 12], unit: 'reps' }],
            gym: [{ name: 'Bench Press', reps: [10, 10, 10], unit: 'reps' }, { name: 'Deadlift', reps: [8, 8, 8], unit: 'reps' }]
        }
    }
};
