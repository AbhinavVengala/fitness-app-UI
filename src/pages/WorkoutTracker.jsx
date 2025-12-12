import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/Card';
import { Home, Building, Trash2, Plus, Search, X, Flame, Timer, Hash, Loader2, Dumbbell } from 'lucide-react';
import { addWorkoutAsync, removeWorkoutAsync } from '../store/slices/dataSlice';
import { selectActiveProfile, selectUserId } from '../store/slices/profileSlice';
import { exercisesApi } from '../api';

const WorkoutTracker = () => {
    const dispatch = useDispatch();
    const { workoutLog } = useSelector(state => state.data);
    const activeProfile = useSelector(selectActiveProfile);
    const userId = useSelector(selectUserId);

    const [activeCategory, setActiveCategory] = useState('home');
    const [exercises, setExercises] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [workoutForm, setWorkoutForm] = useState({
        reps: 10,
        sets: 3,
        duration: 30, // minutes
    });

    // Fetch exercises and categories
    useEffect(() => {
        loadExercises();
        loadCategories();
    }, [userId]);

    const loadCategories = async () => {
        try {
            const cats = await exercisesApi.getCategories();
            setCategories(cats);
        } catch (error) {
            console.error('Failed to load categories:', error);
            setCategories(['home', 'gym', 'yoga', 'hiit', 'sports']);
        }
    };

    const loadExercises = async () => {
        setIsLoading(true);
        try {
            const data = await exercisesApi.getAll(userId);
            setExercises(data);
        } catch (error) {
            console.error('Failed to load exercises:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadExercises();
            return;
        }
        setIsLoading(true);
        try {
            const data = await exercisesApi.search(searchQuery, userId);
            setExercises(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredExercises = exercises.filter(ex =>
        (activeCategory === 'all' || ex.category === activeCategory) &&
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openAddModal = (exercise) => {
        setSelectedExercise(exercise);
        setWorkoutForm({
            reps: 10,
            sets: 3,
            duration: 30,
        });
        setShowAddModal(true);
    };

    const calculateCalories = () => {
        if (!selectedExercise || !activeProfile) return 0;

        if (selectedExercise.type === 'reps') {
            return (selectedExercise.caloriesPerRep || 0.5) * workoutForm.reps * workoutForm.sets;
        } else {
            // Duration-based: MET * weight(kg) * duration(hours)
            const weight = activeProfile.weight || 70;
            const met = selectedExercise.met || 5;
            return met * weight * (workoutForm.duration / 60);
        }
    };

    const handleAddWorkout = async () => {
        if (!selectedExercise || !activeProfile) return;

        const calories = calculateCalories();
        const workoutEntry = {
            id: `workout-${Date.now()}`,
            exerciseId: selectedExercise.id,
            name: selectedExercise.name,
            type: selectedExercise.type,
            category: selectedExercise.category,
            reps: selectedExercise.type === 'reps' ? workoutForm.reps : null,
            sets: selectedExercise.type === 'reps' ? workoutForm.sets : null,
            duration: selectedExercise.type === 'duration' ? workoutForm.duration : null,
            caloriesBurned: calories,
            timestamp: new Date().toISOString(),
        };

        dispatch(addWorkoutAsync({
            profileId: activeProfile.id,
            workout: workoutEntry
        }));

        setShowAddModal(false);
        setSelectedExercise(null);
    };

    const getTotalCaloriesBurned = () => {
        return workoutLog.reduce((total, w) => total + (w.caloriesBurned || 0), 0);
    };

    const CategoryTab = ({ category, icon: Icon, label }) => (
        <button
            onClick={() => setActiveCategory(category)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeCategory === category
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
        >
            {Icon && <Icon size={18} />}
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Workout Tracker</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Select exercises and log your workouts</p>
            </div>

            {/* Stats Card */}
            <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/80 text-sm">Calories Burned Today</p>
                        <p className="text-4xl font-bold">{getTotalCaloriesBurned().toFixed(0)} kcal</p>
                    </div>
                    <Flame className="w-16 h-16 text-white/30" />
                </div>
            </Card>

            {/* Category Tabs & Search */}
            <Card>
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search exercises..."
                            className="w-full px-4 py-3 pl-12 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2">
                        <CategoryTab category="all" label="All" />
                        {categories.map(cat => (
                            <CategoryTab
                                key={cat}
                                category={cat}
                                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                            />
                        ))}
                    </div>
                </div>
            </Card>

            {/* Exercise Grid */}
            <Card>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    Available Exercises
                </h2>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : filteredExercises.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No exercises found</p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredExercises.map(exercise => (
                            <div
                                key={exercise.id}
                                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-indigo-500 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-slate-800 dark:text-white">
                                            {exercise.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                                                {exercise.category}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {exercise.type === 'reps' ? (
                                                    <span className="flex items-center gap-1">
                                                        <Hash size={12} /> Reps
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <Timer size={12} /> Duration
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openAddModal(exercise)}
                                        className="p-2 rounded-lg bg-indigo-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-600"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Today's Logged Workouts */}
            <Card>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    Today's Workouts
                </h2>
                {workoutLog.length > 0 ? (
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {workoutLog.map(log => (
                            <li key={log.id} className="flex justify-between items-center py-3">
                                <div>
                                    <span className="font-medium text-slate-800 dark:text-white">{log.name}</span>
                                    <span className="text-sm text-slate-500 block">
                                        {log.type === 'reps'
                                            ? `${log.sets} sets × ${log.reps} reps`
                                            : `${log.duration} min`
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-red-500">
                                        {log.caloriesBurned?.toFixed(0) || 0} kcal
                                    </span>
                                    <button
                                        onClick={() => dispatch(removeWorkoutAsync({
                                            profileId: activeProfile.id,
                                            workoutId: log.id
                                        }))}
                                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8">
                        <Dumbbell className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="text-slate-500">No workouts logged today</p>
                        <p className="text-sm text-slate-400">Click + on an exercise to add it</p>
                    </div>
                )}
            </Card>

            {/* Add Workout Modal */}
            {showAddModal && selectedExercise && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                Log {selectedExercise.name}
                            </h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {selectedExercise.type === 'reps' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Sets
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={workoutForm.sets}
                                            onChange={(e) => setWorkoutForm({ ...workoutForm, sets: parseInt(e.target.value) || 1 })}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white text-center text-xl font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Reps per Set
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={workoutForm.reps}
                                            onChange={(e) => setWorkoutForm({ ...workoutForm, reps: parseInt(e.target.value) || 1 })}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white text-center text-xl font-bold"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={workoutForm.duration}
                                        onChange={(e) => setWorkoutForm({ ...workoutForm, duration: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white text-center text-xl font-bold"
                                    />
                                </div>
                            )}

                            {/* Calorie Preview */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-center">
                                <p className="text-white/80 text-sm">Estimated Calories</p>
                                <p className="text-3xl font-bold">{calculateCalories().toFixed(0)} kcal</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddWorkout}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Workout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutTracker;