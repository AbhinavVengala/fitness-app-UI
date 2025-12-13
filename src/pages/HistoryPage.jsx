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

    const formatDateRange = (endDateStr) => {
        const end = new Date(endDateStr);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);

        const options = { month: 'short', day: 'numeric' };
        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    };

    return (
        <div className="space-y-6 pb-10 animate-in">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-foreground">History</h1>
                <p className="text-muted-foreground mt-1">View your past logs</p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-center">
                <div className="bg-muted p-1 rounded-xl flex shadow-sm">
                    <button
                        onClick={() => setViewMode('day')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${viewMode === 'day'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Day
                    </button>
                    <button
                        onClick={() => setViewMode('week')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${viewMode === 'week'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
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
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-xl">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div className="text-center">
                            {viewMode === 'week' ? (
                                <div className="flex flex-col items-center">
                                    <span className="text-lg font-semibold text-foreground">
                                        {formatDateRange(selectedDate)}
                                    </span>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                                        Week Ending {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="bg-transparent text-lg font-semibold text-foreground border-none focus:outline-none text-center w-36 cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{formatDate(selectedDate)}</p>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => changeDate(viewMode === 'day' ? 1 : 7)}
                        disabled={selectedDate >= new Date().toISOString().split('T')[0]}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </Card>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : viewMode === 'day' ? (
                <>
                    {/* Day Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Apple className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Consumed</p>
                                    <p className="text-2xl font-bold">{getTotalCaloriesConsumed().toFixed(0)} kcal</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-gradient-to-br from-red-500 to-orange-600 text-white border-none shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Flame className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Burned</p>
                                    <p className="text-2xl font-bold">{getTotalCaloriesBurned().toFixed(0)} kcal</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Food Log */}
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Apple className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Food Log</h2>
                        </div>
                        {foodLog?.items?.length > 0 ? (
                            <ul className="divide-y divide-border">
                                {foodLog.items.map((item, index) => (
                                    <li key={index} className="py-3 flex justify-between items-center group hover:bg-muted/30 transition-colors rounded-lg px-2 -mx-2">
                                        <div>
                                            <p className="font-medium text-foreground">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                <span className="capitalize">{item.meal}</span> • P: {item.protein}g C: {item.carbs}g F: {item.fats}g
                                            </p>
                                        </div>
                                        <span className="text-green-600 dark:text-green-400 font-semibold bg-green-500/10 px-2 py-1 rounded-md text-sm">{item.calories} kcal</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No food logged on this day</p>
                            </div>
                        )}
                    </Card>

                    {/* Workout Log */}
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Workout Log</h2>
                        </div>
                        {workoutLog?.workouts?.length > 0 ? (
                            <ul className="divide-y divide-border">
                                {workoutLog.workouts.map((workout, index) => (
                                    <li key={index} className="py-3 flex justify-between items-center group hover:bg-muted/30 transition-colors rounded-lg px-2 -mx-2">
                                        <div>
                                            <p className="font-medium text-foreground">{workout.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {workout.type === 'reps'
                                                    ? `${workout.sets} sets × ${workout.reps} reps`
                                                    : `${workout.duration} min`
                                                }
                                            </p>
                                        </div>
                                        <span className="text-red-600 dark:text-red-400 font-semibold bg-red-500/10 px-2 py-1 rounded-md text-sm">{workout.caloriesBurned?.toFixed(0)} kcal</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No workouts logged on this day</p>
                            </div>
                        )}
                    </Card>
                </>
            ) : (
                <>
                    {/* Week Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Apple className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Week Total</p>
                                    <p className="text-2xl font-bold">{weekTotals.food.toFixed(0)} kcal</p>
                                    <p className="text-xs text-white/80 mt-1">~{(weekTotals.food / 7).toFixed(0)} avg/day</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-gradient-to-br from-red-500 to-orange-600 text-white border-none shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Flame className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Week Burned</p>
                                    <p className="text-2xl font-bold">{weekTotals.workout.toFixed(0)} kcal</p>
                                    <p className="text-xs text-white/80 mt-1">~{(weekTotals.workout / 7).toFixed(0)} avg/day</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Week Day-by-Day */}
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Daily Breakdown</h2>
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
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-all"
                                    >
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-green-600 dark:text-green-400 font-medium">+{foodCal}</span>
                                            <span className="text-red-600 dark:text-red-400 font-medium">-{workoutCal}</span>
                                            <span className={`font-bold ${foodCal - workoutCal > 0 ? 'text-orange-500' : 'text-blue-500'}`}>
                                                {(foodCal - workoutCal).toFixed(0)}
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
