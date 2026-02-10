import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Apple, Dumbbell, Flame, Utensils, Target, ArrowRight, Droplets, X, Plus } from 'lucide-react';
import { setPage, selectActiveProfile, selectUserId } from '../store/slices/profileSlice';
import { selectDailyTotals, updateWaterAsync } from '../store/slices/dataSlice';

const Dashboard = () => {
    const dispatch = useDispatch();
    const dailyTotals = useSelector(selectDailyTotals);
    const activeProfile = useSelector(selectActiveProfile);
    const userId = useSelector(selectUserId);
    const { goals = {} } = activeProfile || {};

    const netCalories = dailyTotals.calories - dailyTotals.caloriesBurned;
    const goalCalories = goals.calories || 2000;
    const remainingCalories = goalCalories - netCalories;

    // Prepare Chart Data
    const [showWaterModal, setShowWaterModal] = useState(false);
    const pieData = [
        { name: 'Net Calories', value: netCalories > 0 ? netCalories : 0 },
        { name: 'Remaining', value: remainingCalories > 0 ? remainingCalories : 0 }
    ];

    // Tailwind Primary (Indigo) and Muted/Border for remaining
    const COLORS = ['#6366f1', '#e2e8f0'];
    // Dark mode colors handled via CSS variables if we used them in recharts, 
    // but recharts needs hex. We'll stick to a safe palette.

    const StatCard = ({ icon: Icon, label, value, subtext, colorClass, onClick, actionIcon: ActionIcon }) => {
        const Content = () => (
            <>
                <div className="flex justify-between items-start w-full">
                    <div className={`p-3 rounded-xl w-fit ${colorClass}`}>
                        <Icon size={24} />
                    </div>
                    {ActionIcon && (
                        <div className="p-2 rounded-full bg-background/50 text-muted-foreground group-hover:bg-background group-hover:text-primary transition-colors">
                            <ActionIcon size={16} />
                        </div>
                    )}
                </div>
                <div className="text-left">
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
                    {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
                </div>
            </>
        );

        if (onClick) {
            return (
                <button
                    onClick={onClick}
                    className="flex flex-col gap-2 p-6 rounded-xl border shadow-sm bg-card hover:shadow-md hover:scale-[1.02] transition-all duration-300 w-full group"
                >
                    <Content />
                </button>
            );
        }

        return (
            <Card className="flex flex-col gap-2 group">
                <Content />
            </Card>
        );
    };

    return (
        <div className="space-y-8 animate-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Hello, {activeProfile?.name?.split(' ')[0] || 'User'}! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">Here's your daily activity summary.</p>
                </div>
                <div className="text-sm font-medium px-4 py-2 bg-secondary rounded-lg text-secondary-foreground w-fit">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Flame}
                    label="Calories Burned"
                    value={`${dailyTotals.caloriesBurned.toFixed(0)} kcal`}
                    colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                />
                <StatCard
                    icon={Utensils}
                    label="Calories Consumed"
                    value={`${dailyTotals.calories.toFixed(0)} kcal`}
                    colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                />
                <StatCard
                    icon={Target}
                    label="Daily Goal"
                    value={`${goalCalories} kcal`}
                    colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                />
                <StatCard
                    icon={Droplets}
                    label="Water Intake"
                    value={`${dailyTotals.water || 0} ml`}
                    subtext="Tap to add water"
                    colorClass="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
                    onClick={() => setShowWaterModal(true)}
                    actionIcon={Plus}
                />
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calorie Progress Chart */}
                <Card className="col-span-1 lg:col-span-2 flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative w-48 h-48 flex-shrink-0">
                        <div className="relative z-20 w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        innerRadius={60}
                                        outerRadius={80}
                                        startAngle={90}
                                        endAngle={-270}
                                        paddingAngle={0}
                                        cornerRadius={10}
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '8px',
                                            color: 'hsl(var(--foreground))',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            opacity: 1
                                        }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                            <span className="text-3xl font-bold text-foreground">{netCalories.toFixed(0)}</span>
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Net Kcal</span>
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Calorie Feedback</h3>
                        {netCalories > goalCalories ? (
                            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm leading-relaxed">
                                You've exceeded your daily calorie goal. Consider a light workout to balance it out.
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 text-sm leading-relaxed">
                                You are on track! You have <span className="font-bold">{remainingCalories.toFixed(0)}</span> calories remaining for today.
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Budget</span>
                                <span className="text-xl font-bold">{goalCalories}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Remaining</span>
                                <span className="text-xl font-bold text-primary">{remainingCalories > 0 ? remainingCalories.toFixed(0) : 0}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card className="flex flex-col justify-center space-y-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Quick Actions</h3>

                    <button
                        onClick={() => dispatch(setPage('mealLogger'))}
                        className="group flex items-center justify-between p-4 rounded-xl border border-border hover:border-green-500/50 hover:bg-green-500/5 transition-all text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/30">
                                <Apple size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Log a Meal</h4>
                                <p className="text-xs text-muted-foreground">Track breakfast, lunch, or snacks</p>
                            </div>
                        </div>
                        <ArrowRight size={18} className="text-muted-foreground group-hover:text-green-500 transition-colors" />
                    </button>

                    <button
                        onClick={() => dispatch(setPage('workoutTracker'))}
                        className="group flex items-center justify-between p-4 rounded-xl border border-border hover:border-orange-500/50 hover:bg-orange-500/5 transition-all text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900/30">
                                <Dumbbell size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Log Workout</h4>
                                <p className="text-xs text-muted-foreground">Add exercise and track burns</p>
                            </div>
                        </div>
                        <ArrowRight size={18} className="text-muted-foreground group-hover:text-orange-500 transition-colors" />
                    </button>
                </Card>
            </div>

            {/* Water Modal */}
            {showWaterModal && (
                <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="modal-surface rounded-3xl p-6 w-full max-w-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <span className="p-2 bg-cyan-100 text-cyan-600 rounded-full dark:bg-cyan-900/30">
                                    <Droplets size={20} />
                                </span>
                                Log Water
                            </h2>
                            <button
                                onClick={() => setShowWaterModal(false)}
                                className="p-2 hover:bg-muted rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[250, 500, 750, 1000].map(amount => (
                                <button
                                    key={amount}
                                    onClick={() => {
                                        dispatch(updateWaterAsync({
                                            userId,
                                            profileId: activeProfile.id,
                                            amount: amount
                                        }));
                                        setShowWaterModal(false);
                                    }}
                                    className="p-4 rounded-xl border-2 border-muted hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all flex flex-col items-center gap-1 group"
                                >
                                    <span className="text-2xl font-bold text-foreground group-hover:text-cyan-600 transition-colors">
                                        +{amount}
                                    </span>
                                    <span className="text-xs text-muted-foreground uppercase font-bold">ml</span>
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="modal-surface px-2 text-muted-foreground border-none shadow-none">Or custom amount</span>
                            </div>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const val = parseInt(e.target.amount.value);
                                if (val > 0) {
                                    dispatch(updateWaterAsync({
                                        userId,
                                        profileId: activeProfile.id,
                                        amount: val
                                    }));
                                    setShowWaterModal(false);
                                }
                            }}
                            className="mt-4 flex gap-2"
                        >
                            <input
                                name="amount"
                                type="number"
                                placeholder="Enter (ml)"
                                className="flex-1 px-4 py-2 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-cyan-500 outline-none"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors"
                            >
                                Add
                            </button>
                        </form>

                        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">Current Total:</div>
                            <div className="text-xl font-bold text-cyan-600">{dailyTotals.water || 0} ml</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;