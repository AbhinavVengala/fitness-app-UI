import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/Card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Apple, Dumbbell } from 'lucide-react';
import { setPage, selectActiveProfile } from '../store/slices/profileSlice';
import { selectDailyTotals } from '../store/slices/dataSlice';

const Dashboard = () => {
    const dispatch = useDispatch();
    const dailyTotals = useSelector(selectDailyTotals);
    const activeProfile = useSelector(selectActiveProfile);
    const { goals = {} } = activeProfile || {};

    const netCalories = dailyTotals.calories - dailyTotals.caloriesBurned;
    const remainingCalories = (goals.calories || 0) - netCalories;
    const pieData = [{ name: 'Consumed', value: netCalories > 0 ? netCalories : 0 }, { name: 'Remaining', value: remainingCalories > 0 ? remainingCalories : 0 }];
    const COLORS = ['#8884d8', '#e0e0e0'];

    return (<div className="space-y-6"><div className="text-center"><h1 className="text-3xl font-bold">Today's Summary</h1></div><Card className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"><div className="relative w-full h-64"><ResponsiveContainer><PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={60} fill="#8884d8" paddingAngle={5}>{pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie></PieChart></ResponsiveContainer><div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-3xl font-bold">{netCalories.toFixed(0)}</span><span className="text-sm text-gray-500">Net Calories</span></div></div><div className="text-center md:text-left"><p>Consumed: <span className="font-semibold text-green-500">{dailyTotals.calories.toFixed(0)} kcal</span></p><p>Burned: <span className="font-semibold text-red-500">{dailyTotals.caloriesBurned.toFixed(0)} kcal</span></p><p className="font-bold mt-2">Goal: <span className="font-bold text-blue-500">{goals.calories || 0} kcal</span></p></div></Card><div className="flex justify-center gap-4 pt-4"><button onClick={() => dispatch(setPage('mealLogger'))} className="flex items-center gap-2 bg-green-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-green-600"><Apple /> Log Food</button><button onClick={() => dispatch(setPage('workoutTracker'))} className="flex items-center gap-2 bg-orange-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-orange-600"><Dumbbell /> Start Workout</button></div></div>);
};

export default Dashboard;