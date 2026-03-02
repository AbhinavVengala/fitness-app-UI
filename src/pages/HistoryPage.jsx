import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Card from '../components/Card';
import { Calendar, ChevronLeft, ChevronRight, Apple, Flame, Loader2, TrendingUp, Droplets } from 'lucide-react';
import { foodLogApi, workoutLogApi, profileApi } from '../api';
import { selectActiveProfile } from '../store/slices/profileSlice';

// ─────────────────────────────────────────────
// Normalize any date format from the backend to "YYYY-MM-DD"
// Handles: "2026-03-02", [2026,3,2], {year,monthValue,dayOfMonth}
// ─────────────────────────────────────────────
const normalizeDate = (d) => {
    if (!d) return null;
    if (typeof d === 'string') return d.slice(0, 10); // already a string, trim any time part
    if (Array.isArray(d)) {
        // Java LocalDate serialized as [year, month, day]
        const [y, m, day] = d;
        return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    if (typeof d === 'object' && d.year) {
        // Java LocalDate serialized as object
        const { year, monthValue, dayOfMonth } = d;
        return `${year}-${String(monthValue).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`;
    }
    return String(d).slice(0, 10);
};

const HistoryPage = () => {
    const activeProfile = useSelector(selectActiveProfile);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [foodLog, setFoodLog] = useState(null);
    const [workoutLog, setWorkoutLog] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState('day');
    const [weekLogs, setWeekLogs] = useState({ food: [], workout: [] });
    const [weekWaterMap, setWeekWaterMap] = useState({}); // dateStr -> waterIntake

    // Load logs when date or view changes
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
            console.error('Failed to load day logs:', error);
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

            // Fetch food + workout range in parallel
            const [foodLogs, workoutLogs] = await Promise.all([
                foodLogApi.getLogsByRange(activeProfile.id, startStr, endStr),
                workoutLogApi.getLogsByRange(activeProfile.id, startStr, endStr)
            ]);

            // Normalize date field on every log so .find() works reliably
            const normalizedFood = (foodLogs || []).map(l => ({ ...l, date: normalizeDate(l.date) }));
            const normalizedWorkout = (workoutLogs || []).map(l => ({ ...l, date: normalizeDate(l.date) }));

            setWeekLogs({ food: normalizedFood, workout: normalizedWorkout });

            // Build water map from profiles — fetch daily profile data for water
            // We load each day's profile water from the existing day endpoint via the profile data
            // The water is stored on the profile itself (not log), so we fetch today's for the selected week
            // Build a rough map from the current profile's waterIntake for today only
            // For a full week map, we'd need a dedicated API; for now show today's water on today's row
            const waterMap = {};
            const today = new Date().toISOString().split('T')[0];
            if (activeProfile.waterIntake != null) {
                waterMap[today] = activeProfile.waterIntake;
            }
            setWeekWaterMap(waterMap);

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

        return date.toLocaleDateString('en-IN', {
            weekday: 'long', month: 'short', day: 'numeric'
        });
    };

    const getTotalCaloriesConsumed = () =>
        foodLog?.items?.reduce((sum, item) => sum + (item.calories || 0), 0) || 0;

    const getTotalCaloriesBurned = () =>
        workoutLog?.workouts?.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0) || 0;

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
        const opts = { month: 'short', day: 'numeric' };
        return `${start.toLocaleDateString('en-IN', opts)} – ${end.toLocaleDateString('en-IN', opts)}`;
    };

    const today = new Date().toISOString().split('T')[0];
    const isFuture = selectedDate > today;

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
                    {['day', 'week'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-6 py-2 rounded-lg font-medium transition-all capitalize ${viewMode === mode
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
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
                                        Week Ending {new Date(selectedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        max={today}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="bg-transparent text-lg font-semibold text-foreground border-none focus:outline-none text-center w-36 cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                                        {formatDate(selectedDate)}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => changeDate(viewMode === 'day' ? 1 : 7)}
                        disabled={isFuture || (viewMode === 'day' && selectedDate >= today)}
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
                        <SummaryCard
                            color="from-green-500 to-emerald-600"
                            icon={Apple}
                            label="Consumed"
                            value={getTotalCaloriesConsumed().toFixed(0)}
                            unit="kcal"
                        />
                        <SummaryCard
                            color="from-red-500 to-orange-600"
                            icon={Flame}
                            label="Burned"
                            value={getTotalCaloriesBurned().toFixed(0)}
                            unit="kcal"
                        />
                    </div>

                    {/* Net balance bar */}
                    {(getTotalCaloriesConsumed() > 0 || getTotalCaloriesBurned() > 0) && (
                        <Card>
                            <p className="text-sm text-muted-foreground mb-1">Net calories</p>
                            <p className={`text-2xl font-bold ${getTotalCaloriesConsumed() - getTotalCaloriesBurned() > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                {(getTotalCaloriesConsumed() - getTotalCaloriesBurned()).toFixed(0)} kcal
                            </p>
                        </Card>
                    )}

                    {/* Food Log */}
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Apple className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Food Log</h2>
                            {foodLog?.items?.length > 0 && (
                                <span className="ml-auto text-sm text-muted-foreground">
                                    {foodLog.items.length} item{foodLog.items.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        {foodLog?.items?.length > 0 ? (
                            <ul className="divide-y divide-border">
                                {foodLog.items.map((item, idx) => (
                                    <li key={idx} className="py-3 flex justify-between items-center hover:bg-muted/30 transition-colors rounded-lg px-2 -mx-2">
                                        <div>
                                            <p className="font-medium text-foreground">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                <span className="capitalize">{item.meal}</span> · P: {item.protein}g C: {item.carbs}g F: {item.fats}g
                                            </p>
                                        </div>
                                        <span className="text-green-600 dark:text-green-400 font-semibold bg-green-500/10 px-2 py-1 rounded-md text-sm shrink-0 ml-3">
                                            {item.calories} kcal
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8">
                                <Apple className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
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
                            {workoutLog?.workouts?.length > 0 && (
                                <span className="ml-auto text-sm text-muted-foreground">
                                    {workoutLog.workouts.length} workout{workoutLog.workouts.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        {workoutLog?.workouts?.length > 0 ? (
                            <ul className="divide-y divide-border">
                                {workoutLog.workouts.map((workout, idx) => (
                                    <li key={idx} className="py-3 flex justify-between items-center hover:bg-muted/30 transition-colors rounded-lg px-2 -mx-2">
                                        <div>
                                            <p className="font-medium text-foreground">{workout.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {workout.type === 'reps'
                                                    ? `${workout.sets} sets × ${workout.reps} reps`
                                                    : `${workout.duration} min`}
                                            </p>
                                        </div>
                                        <span className="text-red-600 dark:text-red-400 font-semibold bg-red-500/10 px-2 py-1 rounded-md text-sm shrink-0 ml-3">
                                            {workout.caloriesBurned?.toFixed(0)} kcal
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8">
                                <Flame className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-muted-foreground">No workouts logged on this day</p>
                            </div>
                        )}
                    </Card>
                </>
            ) : (
                <>
                    {/* Week Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <SummaryCard
                            color="from-green-500 to-emerald-600"
                            icon={Apple}
                            label="Week Consumed"
                            value={weekTotals.food.toFixed(0)}
                            unit="kcal"
                            sub={`~${(weekTotals.food / 7).toFixed(0)} avg/day`}
                        />
                        <SummaryCard
                            color="from-red-500 to-orange-600"
                            icon={Flame}
                            label="Week Burned"
                            value={weekTotals.workout.toFixed(0)}
                            unit="kcal"
                            sub={`~${(weekTotals.workout / 7).toFixed(0)} avg/day`}
                        />
                    </div>

                    {/* Week Day-by-Day Breakdown */}
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Daily Breakdown</h2>
                        </div>

                        {/* Column headers */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium uppercase tracking-wide px-3 mb-2">
                            <span>Day</span>
                            <div className="flex items-center gap-4">
                                <span className="text-green-600 dark:text-green-400">In</span>
                                <span className="text-red-600 dark:text-red-400">Out</span>
                                <span className="w-14 text-right">Net</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {[...Array(7)].map((_, i) => {
                                const date = new Date(selectedDate);
                                date.setDate(date.getDate() - (6 - i));
                                const dateStr = date.toISOString().split('T')[0];

                                // Normalized date match — works for any backend format
                                const dayFood = weekLogs.food.find(l => l.date === dateStr);
                                const dayWorkout = weekLogs.workout.find(l => l.date === dateStr);

                                const foodCal = dayFood?.items?.reduce((s, item) => s + (item.calories || 0), 0) || 0;
                                const workoutCal = dayWorkout?.workouts?.reduce((s, w) => s + (w.caloriesBurned || 0), 0) || 0;
                                const net = foodCal - workoutCal;
                                const water = weekWaterMap[dateStr] ?? null;
                                const isToday = dateStr === today;
                                const hasFuture = dateStr > today;

                                return (
                                    <div
                                        key={i}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all border ${isToday
                                            ? 'bg-primary/5 border-primary/30'
                                            : 'bg-muted/30 border-transparent hover:border-border'
                                            } ${hasFuture ? 'opacity-40' : ''}`}
                                    >
                                        <div>
                                            <p className={`font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                                                {isToday ? 'Today' : date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                            {water != null && (
                                                <p className="text-xs text-cyan-500 flex items-center gap-1 mt-0.5">
                                                    <Droplets size={10} /> {water} ml
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className={`font-medium min-w-[3rem] text-right ${foodCal > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                                +{foodCal}
                                            </span>
                                            <span className={`font-medium min-w-[3rem] text-right ${workoutCal > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                                                -{workoutCal}
                                            </span>
                                            <span className={`font-bold min-w-[3.5rem] text-right ${net > 0 ? 'text-orange-500' : net < 0 ? 'text-blue-500' : 'text-muted-foreground'}`}>
                                                {net !== 0 ? net.toFixed(0) : '—'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {weekLogs.food.length === 0 && weekLogs.workout.length === 0 && (
                            <div className="text-center py-6 mt-2">
                                <p className="text-muted-foreground text-sm">No data logged this week</p>
                            </div>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const SummaryCard = ({ color, icon: Icon, label, value, unit, sub }) => (
    <Card className={`bg-gradient-to-br ${color} text-white border-none shadow-lg`}>
        <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl shrink-0">
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-white/80 text-xs font-medium uppercase tracking-wider truncate">{label}</p>
                <p className="text-2xl font-bold leading-tight">{value} <span className="text-sm font-normal">{unit}</span></p>
                {sub && <p className="text-xs text-white/70 mt-0.5">{sub}</p>}
            </div>
        </div>
    </Card>
);

export default HistoryPage;
