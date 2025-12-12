import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Card from '../components/Card';
import { Calendar, ChevronLeft, ChevronRight, Apple, Flame, Loader2, TrendingUp } from 'lucide-react';
import { foodLogApi, workoutLogApi } from '../api';
import { selectActiveProfile } from '../store/slices/profileSlice';

const HistoryPage = () => {
    const activeProfile = useSelector(selectActiveProfile);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [foodLog, setFoodLog] = useState(null);
    const [workoutLog, setWorkoutLog] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState('day'); // 'day' or 'week'
    const [weekLogs, setWeekLogs] = useState({ food: [], workout: [] });

    // Load logs when date changes
    useEffect(() => {
        if (activeProfile?.id) {
            if (viewMode === 'day') {
                loadDayLogs();
            } else {
                loadWeekLogs();
            }
        }
    }, [selectedDate, activeProfile?.id, viewMode]);

    const loadDayLogs = async () => {
        setIsLoading(true);
        try {
            const [food, workout] = await Promise.all([
                foodLogApi.getLogByDate(activeProfile.id, selectedDate),
                workoutLogApi.getLogByDate(activeProfile.id, selectedDate)
            ]);
            setFoodLog(food);
            setWorkoutLog(workout);
        } catch (error) {
            console.error('Failed to load logs:', error);
            setFoodLog({ items: [] });
            setWorkoutLog({ workouts: [] });
        } finally {
            setIsLoading(false);
        }
    };

    const loadWeekLogs = async () => {
        setIsLoading(true);
        try {
            const endDate = new Date(selectedDate);
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 6);

            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];

            const [food, workout] = await Promise.all([
                foodLogApi.getLogsByRange(activeProfile.id, startStr, endStr),
                workoutLogApi.getLogsByRange(activeProfile.id, startStr, endStr)
            ]);
            setWeekLogs({ food: food || [], workout: workout || [] });
        } catch (error) {
            console.error('Failed to load week logs:', error);
            setWeekLogs({ food: [], workout: [] });
        } finally {
            setIsLoading(false);
        }
    };

    const changeDate = (days) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (dateStr === today.toISOString().split('T')[0]) return 'Today';
        if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';

        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTotalCaloriesConsumed = () => {
        if (!foodLog?.items) return 0;
        return foodLog.items.reduce((sum, item) => sum + (item.calories || 0), 0);
    };

    const getTotalCaloriesBurned = () => {
        if (!workoutLog?.workouts) return 0;
        return workoutLog.workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    };

    const getWeekTotals = () => {
        const foodTotal = weekLogs.food.reduce((sum, log) =>
            sum + (log.items?.reduce((s, i) => s + (i.calories || 0), 0) || 0), 0);
        const workoutTotal = weekLogs.workout.reduce((sum, log) =>
            sum + (log.workouts?.reduce((s, w) => s + (w.caloriesBurned || 0), 0) || 0), 0);
        return { food: foodTotal, workout: workoutTotal };
    };

    const weekTotals = getWeekTotals();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">History</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">View your past logs</p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-center">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1 flex">
                    <button
                        onClick={() => setViewMode('day')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${viewMode === 'day'
                                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                    >
                        Day
                    </button>
                    <button
                        onClick={() => setViewMode('week')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${viewMode === 'week'
                                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                    >
                        Week
                    </button>
                </div>
            </div>

            {/* Date Navigation */}
            <Card>
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => changeDate(viewMode === 'day' ? -1 : -7)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <div>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent text-lg font-semibold text-slate-800 dark:text-white border-none focus:outline-none"
                            />
                            <p className="text-sm text-slate-500 text-center">{formatDate(selectedDate)}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => changeDate(viewMode === 'day' ? 1 : 7)}
                        disabled={selectedDate >= new Date().toISOString().split('T')[0]}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </Card>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : viewMode === 'day' ? (
                <>
                    {/* Day Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            <div className="flex items-center gap-3">
                                <Apple className="w-10 h-10 text-white/30" />
                                <div>
                                    <p className="text-white/80 text-sm">Consumed</p>
                                    <p className="text-2xl font-bold">{getTotalCaloriesConsumed().toFixed(0)} kcal</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                            <div className="flex items-center gap-3">
                                <Flame className="w-10 h-10 text-white/30" />
                                <div>
                                    <p className="text-white/80 text-sm">Burned</p>
                                    <p className="text-2xl font-bold">{getTotalCaloriesBurned().toFixed(0)} kcal</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Food Log */}
                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <Apple className="w-5 h-5 text-green-500" />
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Food Log</h2>
                        </div>
                        {foodLog?.items?.length > 0 ? (
                            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                {foodLog.items.map((item, index) => (
                                    <li key={index} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white">{item.name}</p>
                                            <p className="text-sm text-slate-500">
                                                {item.meal} • P: {item.protein}g C: {item.carbs}g F: {item.fats}g
                                            </p>
                                        </div>
                                        <span className="text-green-600 font-semibold">{item.calories} kcal</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-slate-500 py-4">No food logged on this day</p>
                        )}
                    </Card>

                    {/* Workout Log */}
                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <Flame className="w-5 h-5 text-red-500" />
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Workout Log</h2>
                        </div>
                        {workoutLog?.workouts?.length > 0 ? (
                            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                {workoutLog.workouts.map((workout, index) => (
                                    <li key={index} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white">{workout.name}</p>
                                            <p className="text-sm text-slate-500">
                                                {workout.type === 'reps'
                                                    ? `${workout.sets} sets × ${workout.reps} reps`
                                                    : `${workout.duration} min`
                                                }
                                            </p>
                                        </div>
                                        <span className="text-red-500 font-semibold">{workout.caloriesBurned?.toFixed(0)} kcal</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-slate-500 py-4">No workouts logged on this day</p>
                        )}
                    </Card>
                </>
            ) : (
                <>
                    {/* Week Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            <div className="flex items-center gap-3">
                                <Apple className="w-10 h-10 text-white/30" />
                                <div>
                                    <p className="text-white/80 text-sm">Week Total Consumed</p>
                                    <p className="text-2xl font-bold">{weekTotals.food.toFixed(0)} kcal</p>
                                    <p className="text-sm text-white/80">~{(weekTotals.food / 7).toFixed(0)} avg/day</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                            <div className="flex items-center gap-3">
                                <Flame className="w-10 h-10 text-white/30" />
                                <div>
                                    <p className="text-white/80 text-sm">Week Total Burned</p>
                                    <p className="text-2xl font-bold">{weekTotals.workout.toFixed(0)} kcal</p>
                                    <p className="text-sm text-white/80">~{(weekTotals.workout / 7).toFixed(0)} avg/day</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Week Day-by-Day */}
                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Daily Breakdown</h2>
                        </div>
                        <div className="space-y-3">
                            {[...Array(7)].map((_, i) => {
                                const date = new Date(selectedDate);
                                date.setDate(date.getDate() - (6 - i));
                                const dateStr = date.toISOString().split('T')[0];

                                const dayFood = weekLogs.food.find(l => l.date === dateStr);
                                const dayWorkout = weekLogs.workout.find(l => l.date === dateStr);

                                const foodCal = dayFood?.items?.reduce((s, i) => s + (i.calories || 0), 0) || 0;
                                const workoutCal = dayWorkout?.workouts?.reduce((s, w) => s + (w.caloriesBurned || 0), 0) || 0;

                                return (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700"
                                    >
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white">
                                                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-green-600">🍎 {foodCal} kcal</span>
                                            <span className="text-red-500">🔥 {workoutCal} kcal</span>
                                            <span className={`font-semibold ${foodCal - workoutCal > 0 ? 'text-orange-500' : 'text-blue-500'}`}>
                                                Net: {(foodCal - workoutCal).toFixed(0)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
};

export default HistoryPage;
