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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all border ${activeCategory === category
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
        >
            {Icon && <Icon size={18} />}
            {label}
        </button>
    );

    return (
        <>
            <div className="space-y-6 pb-10 animate-in">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground">Workout Tracker</h1>
                    <p className="text-muted-foreground mt-1">Select exercises and log your workouts</p>
                </div>

                {/* Stats Card */}
                <Card className="bg-gradient-to-br from-red-500 to-orange-600 text-white border-none shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm font-medium">Calories Burned Today</p>
                            <p className="text-4xl font-bold mt-1">{getTotalCaloriesBurned().toFixed(0)} kcal</p>
                        </div>
                        <div className="bg-white/20 p-4 rounded-2xl">
                            <Flame className="w-10 h-10 text-white" />
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Search & Exercises */}
                    <div className="lg:col-span-2 space-y-6">
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
                                        className="input-modern bg-background !pl-14"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-foreground">
                                    Available Exercises
                                </h2>
                                <span className="text-sm text-muted-foreground">{filteredExercises.length} items</span>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : filteredExercises.length === 0 ? (
                                <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                                    <Dumbbell className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No exercises found</p>
                                </div>
                            ) : (
                                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {filteredExercises.map(exercise => (
                                        <WorkoutCard
                                            key={exercise.id}
                                            exercise={exercise}
                                            onAdd={() => openAddModal(exercise)}
                                        />
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Right Column: Today's Workouts */}
                    <div className="space-y-6">
                        <Card className="lg:sticky lg:top-6 h-fit">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-foreground">
                                    Today's Workouts
                                </h2>
                            </div>
                            {workoutLog.length > 0 ? (
                                <ul className="divide-y divide-border">
                                    {workoutLog.map(log => (
                                        <li key={log.id} className="flex justify-between items-center py-3 group">
                                            <div>
                                                <span className="font-medium text-foreground">{log.name}</span>
                                                <span className="text-sm text-muted-foreground block">
                                                    {log.type === 'reps'
                                                        ? `${log.sets} sets × ${log.reps} reps`
                                                        : `${log.duration} min`
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-orange-500 dark:text-orange-400">
                                                    {log.caloriesBurned?.toFixed(0) || 0} kcal
                                                </span>
                                                <button
                                                    onClick={() => dispatch(removeWorkoutAsync({
                                                        profileId: activeProfile.id,
                                                        workoutId: log.id
                                                    }))}
                                                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Dumbbell className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">No workouts logged today</p>
                                    <p className="text-sm text-muted-foreground/70">Click + on an exercise to add it</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {/* Add Workout Modal */}
            {showAddModal && selectedExercise && (
                <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in">
                    <div className="modal-surface rounded-3xl p-5 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-foreground">
                                Log {selectedExercise.name}
                            </h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-muted rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {selectedExercise.type === 'reps' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2 text-center">
                                            Sets
                                        </label>
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => setWorkoutForm(prev => ({ ...prev, sets: Math.max(1, prev.sets - 1) }))}
                                                className="w-12 h-12 rounded-xl bg-muted text-foreground font-bold text-xl hover:bg-muted/80 transition-colors flex items-center justify-center"
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={workoutForm.sets}
                                                onChange={(e) => setWorkoutForm(prev => ({ ...prev, sets: parseInt(e.target.value) || 1 }))}
                                                className="w-20 h-12 rounded-xl bg-background border border-border text-foreground text-center text-2xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none p-0"
                                            />
                                            <button
                                                onClick={() => setWorkoutForm(prev => ({ ...prev, sets: prev.sets + 1 }))}
                                                className="w-12 h-12 rounded-xl bg-muted text-foreground font-bold text-xl hover:bg-muted/80 transition-colors flex items-center justify-center"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2 text-center">
                                            Reps per Set
                                        </label>
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => setWorkoutForm(prev => ({ ...prev, reps: Math.max(1, prev.reps - 1) }))}
                                                className="w-12 h-12 rounded-xl bg-muted text-foreground font-bold text-xl hover:bg-muted/80 transition-colors flex items-center justify-center"
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={workoutForm.reps}
                                                onChange={(e) => setWorkoutForm(prev => ({ ...prev, reps: parseInt(e.target.value) || 1 }))}
                                                className="w-20 h-12 rounded-xl bg-background border border-border text-foreground text-center text-2xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none p-0"
                                            />
                                            <button
                                                onClick={() => setWorkoutForm(prev => ({ ...prev, reps: prev.reps + 1 }))}
                                                className="w-12 h-12 rounded-xl bg-muted text-foreground font-bold text-xl hover:bg-muted/80 transition-colors flex items-center justify-center"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2 text-center">
                                        Duration (minutes)
                                    </label>
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => setWorkoutForm(prev => ({ ...prev, duration: Math.max(5, prev.duration - 5) }))}
                                            className="w-12 h-12 rounded-xl bg-muted text-foreground font-bold text-xl hover:bg-muted/80 transition-colors flex items-center justify-center"
                                        >
                                            −
                                        </button>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                value={workoutForm.duration}
                                                onChange={(e) => setWorkoutForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                                                className="w-24 h-12 rounded-xl bg-background border border-border text-foreground text-center text-2xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none p-0"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">m</span>
                                        </div>
                                        <button
                                            onClick={() => setWorkoutForm(prev => ({ ...prev, duration: prev.duration + 5 }))}
                                            className="w-12 h-12 rounded-xl bg-muted text-foreground font-bold text-xl hover:bg-muted/80 transition-colors flex items-center justify-center"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Calorie Preview */}
                            <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
                                <p className="text-muted-foreground text-sm">Estimated Calories</p>
                                <p className="text-3xl font-bold text-foreground mt-1">{calculateCalories().toFixed(0)} kcal</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddWorkout}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold btn-primary flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Workout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const WorkoutCard = ({ exercise, onAdd }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="rounded-xl bg-card border border-border hover:border-primary/50 transition-all group shadow-sm hover:shadow-md overflow-hidden flex flex-col h-full">
            <div className="relative h-40 w-full bg-muted">
                {!imageError ? (
                    <img
                        src={exercise.imageUrl || 'https://images.unsplash.com/photo-1517836357463-c25dfe94c0de?auto=format&fit=crop&w=500&q=80'}
                        onError={() => setImageError(true)}
                        alt={exercise.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 text-muted-foreground">
                        <Dumbbell className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-xs font-medium">No Image</span>
                    </div>
                )}

                <div className="absolute top-2 left-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/10">
                        {exercise.category}
                    </span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdd();
                    }}
                    className="absolute bottom-2 right-2 p-2 rounded-lg bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-all z-10"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-1" title={exercise.name}>
                    {exercise.name}
                </h3>

                <div className="mt-auto pt-3 flex items-center justify-between text-sm text-muted-foreground border-t border-border">
                    <div className="flex items-center gap-1">
                        {exercise.type === 'reps' ? <Hash size={14} /> : <Timer size={14} />}
                        <span className="capitalize">{exercise.type}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkoutTracker;