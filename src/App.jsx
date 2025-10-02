import React, { useState, createContext, useContext, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Shield, Apple, Dumbbell, Droplet, Settings, Plus, Minus, Trash2, Edit, Save, X, Search, CheckSquare, Square, Home, Building, Zap, LogIn, UserPlus, Users, LogOut, Loader2, UserCircle } from 'lucide-react';


// --- MOCK DATABASE ---
// This object simulates a simple database for a multi-user MVP.
// Data will reset on page refresh.
const mockDatabase = {
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
const indianFoodDatabase = [
    { name: 'Roti / Chapati (1 medium)', calories: 85, protein: 3, carbs: 15, fats: 1.5 },
    { name: 'Plain Dosa (1 medium)', calories: 120, protein: 3, carbs: 25, fats: 2 },
    { name: 'Idli (1 piece)', calories: 40, protein: 1, carbs: 8, fats: 0.2 },
];
const generalFoodDatabase = [
    { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
    { name: 'Chicken Breast (100g grilled)', calories: 165, protein: 31, carbs: 3.6 },
    { name: 'Oats (1/2 cup dry)', calories: 150, protein: 5, carbs: 27, fats: 2.5 },
];
const combinedFoodDatabase = [...indianFoodDatabase, ...generalFoodDatabase];
const exercises = {
    'Jumping Jacks': { type: 'duration', met: 8.0, category: 'home' },
    'Push-ups': { type: 'reps', caloriesPerRep: 0.8, category: 'home' },
    'Squats': { type: 'reps', caloriesPerRep: 0.6, category: 'home' },
    'Bench Press': { type: 'reps', caloriesPerRep: 1.2, category: 'gym' },
    'Deadlift': { type: 'reps', caloriesPerRep: 1.8, category: 'gym' },
    'Running': { type: 'duration', met: 9.8, category: 'sports' },
    'Cycling': { type: 'duration', met: 7.5, category: 'sports' },
};
const workoutPlans = {
    beginner: {
        generalFitness: {
            home: [{ name: 'Jumping Jacks', reps: [180], unit: 'seconds' }, { name: 'Squats', reps: [12, 12, 12], unit: 'reps' }],
            gym: [{ name: 'Bench Press', reps: [10, 10, 10], unit: 'reps' }, { name: 'Deadlift', reps: [8, 8, 8], unit: 'reps' }]
        }
    }
};

// --- CONTEXT API for State Management ---
const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [dbState, setDbState] = useState(mockDatabase);
    const [authUser, setAuthUser] = useState(null);
    const [activeProfileId, setActiveProfileId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState('dashboard');

    useEffect(() => { setTimeout(() => setIsLoading(false), 500); }, []);

    const userProfiles = authUser ? Object.values(dbState.users[authUser]?.profiles || {}) : [];
    const activeProfile = authUser && activeProfileId ? dbState.users[authUser].profiles[activeProfileId] : null;
    
    const foodLog = activeProfile?.foodLog || [];
    const workoutLog = activeProfile?.workoutLog || [];
    const goals = activeProfile?.goals || {};
    const waterIntake = activeProfile?.waterIntake || 0;

    const dailyTotals = useMemo(() => ({
        calories: foodLog.reduce((sum, item) => sum + item.calories, 0),
        protein: foodLog.reduce((sum, item) => sum + item.protein, 0),
        carbs: foodLog.reduce((sum, item) => sum + item.carbs, 0),
        fats: foodLog.reduce((sum, item) => sum + item.fats, 0),
        caloriesBurned: workoutLog.reduce((sum, item) => sum + item.caloriesBurned, 0),
    }), [foodLog, workoutLog]);

    const login = (email, password) => {
        const user = dbState.users[email];
        if (user && user.password === password) {
            setAuthUser(email);
            const firstProfileId = Object.keys(user.profiles)[0];
            if (firstProfileId) { setActiveProfileId(firstProfileId); }
            setError('');
            return true;
        }
        setError("Invalid email or password.");
        return false;
    };

    const logout = () => { setAuthUser(null); setActiveProfileId(null); };

    const updateDbProfile = (profileId, newProfileData) => {
        setDbState(prevDb => ({ ...prevDb, users: { ...prevDb.users, [authUser]: { ...prevDb.users[authUser], profiles: { ...prevDb.users[authUser].profiles, [profileId]: { ...prevDb.users[authUser].profiles[profileId], ...newProfileData }}}}}));
    };
    
    const addFood = (food) => { if (!activeProfile) return; const newFood = { ...food, id: Date.now() }; updateDbProfile(activeProfileId, { foodLog: [...foodLog, newFood] }); };
    const removeFood = (id) => { if (!activeProfile) return; updateDbProfile(activeProfileId, { foodLog: foodLog.filter(f => f.id !== id) }); };
    const addWorkout = (workout) => { if (!activeProfile) return; updateDbProfile(activeProfileId, { workoutLog: [...workoutLog, workout] }); };
    const updateWorkout = (id, updatedData) => { if (!activeProfile) return; const newLog = workoutLog.map(w => w.id === id ? { ...w, ...updatedData } : w); updateDbProfile(activeProfileId, { workoutLog: newLog }); };
    const removeWorkout = (id) => { if (!activeProfile) return; updateDbProfile(activeProfileId, { workoutLog: workoutLog.filter(w => w.id !== id) }); };
    const updateProfileDetails = (newDetails) => { if (!activeProfile) return; updateDbProfile(activeProfileId, newDetails); };
    const updateGoals = (newGoals) => { if (!activeProfile) return; updateDbProfile(activeProfileId, { goals: newGoals }); };
    const updateWater = (newIntake) => { if (!activeProfile) return; updateDbProfile(activeProfileId, { waterIntake: newIntake }); };

    const value = { page, setPage, authUser, login, logout, isLoading, error, setError, userProfiles, activeProfile, setActiveProfileId, goals, foodLog, workoutLog, waterIntake, dailyTotals, addFood, removeFood, addWorkout, updateWorkout, removeWorkout, updateProfileDetails, updateGoals, updateWater };
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useApp = () => useContext(AppContext);

// --- AUTH & PROFILE MANAGEMENT ---
const AuthPage = () => {
    const { login, setError, error } = useApp();
    const [email, setEmail] = useState('user@example.com');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => { e.preventDefault(); setLoading(true); setError(''); setTimeout(() => { login(email, password); setLoading(false); }, 500); };

    return (<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900"><Card className="w-full max-w-sm"><h1 className="text-2xl font-bold text-center mb-1">Fitness Tracker MVP</h1><p className="text-center text-sm text-gray-500 mb-6">Log in with: user@example.com / password123</p><form onSubmit={handleSubmit} className="space-y-4"><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded-md" required /><input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded-md" required /><button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'Login'}</button>{error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}</form></Card></div>);
};

const ProfileManagementPage = () => {
    const { userProfiles, setActiveProfileId, setPage } = useApp();
    return (<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900"><Card className="w-full max-w-sm"><h1 className="text-2xl font-bold text-center mb-4">Select Profile</h1><div className="space-y-2">{userProfiles.map(profile => (<div key={profile.id} onClick={() => { setActiveProfileId(profile.id); setPage('dashboard'); }} className="p-4 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 flex items-center gap-4"><UserCircle size={24} /><span>{profile.name}</span></div>))}</div></Card></div>);
};

// --- UI COMPONENTS ---
const Card = ({ children, className = '' }) => <div className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 ${className}`}>{children}</div>;

const Dashboard = () => {
    const { dailyTotals, activeProfile, setPage } = useApp();
    const { goals = {}, waterIntake = 0 } = activeProfile || {};
    const netCalories = dailyTotals.calories - dailyTotals.caloriesBurned;
    const remainingCalories = (goals.calories || 0) - netCalories;
    const pieData = [{ name: 'Consumed', value: netCalories > 0 ? netCalories : 0 }, { name: 'Remaining', value: remainingCalories > 0 ? remainingCalories : 0 }];
    const COLORS = ['#8884d8', '#e0e0e0'];

    return (<div className="space-y-6"><div className="text-center"><h1 className="text-3xl font-bold">Today's Summary</h1></div><Card className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"><div className="relative w-full h-64"><ResponsiveContainer><PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={60} fill="#8884d8" paddingAngle={5}>{pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie></PieChart></ResponsiveContainer><div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-3xl font-bold">{netCalories.toFixed(0)}</span><span className="text-sm text-gray-500">Net Calories</span></div></div><div className="text-center md:text-left"><p>Consumed: <span className="font-semibold text-green-500">{dailyTotals.calories.toFixed(0)} kcal</span></p><p>Burned: <span className="font-semibold text-red-500">{dailyTotals.caloriesBurned.toFixed(0)} kcal</span></p><p className="font-bold mt-2">Goal: <span className="font-bold text-blue-500">{goals.calories || 0} kcal</span></p></div></Card><div className="flex justify-center gap-4 pt-4"><button onClick={() => setPage('mealLogger')} className="flex items-center gap-2 bg-green-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-green-600"><Apple /> Log Food</button><button onClick={() => setPage('workoutTracker')} className="flex items-center gap-2 bg-orange-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-orange-600"><Dumbbell /> Start Workout</button></div></div>);
};

const MealLogger = () => {
    const { foodLog, removeFood, addFood } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [mealType, setMealType] = useState('snack');
    const searchResults = useMemo(() => { if (!searchTerm.trim()) return []; const lowerCaseSearch = searchTerm.toLowerCase(); return combinedFoodDatabase.filter(food => food.name.toLowerCase().includes(lowerCaseSearch)); }, [searchTerm]);
    const handleAddFood = (food) => { addFood({ ...food, meal: mealType }); setSearchTerm(''); };
    return (<div className="space-y-6"><h1 className="text-3xl font-bold text-center">Meal Log</h1><Card><h2 className="text-xl font-bold mb-4">Add Food</h2><div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Search for a food..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-full"/></div><div className="flex justify-center gap-2 mb-4">{['breakfast', 'lunch', 'dinner', 'snack'].map(type => <button key={type} onClick={() => setMealType(type)} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${mealType === type ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</button>)}</div>{searchTerm && <div className="max-h-60 overflow-y-auto">{searchResults.map((item, index) => (<div key={index} className="flex justify-between items-center p-2 hover:bg-gray-100"><div><p>{item.name}</p><p className="text-sm text-gray-500">{item.calories} kcal</p></div><button onClick={() => handleAddFood(item)} className="bg-green-500 text-white p-2 rounded-full"><Plus size={16} /></button></div>))}</div>}</Card><Card><h2 className="text-xl font-bold mb-2">Today's Log</h2><ul className="divide-y">{foodLog.map(food => <li key={food.id} className="flex justify-between items-center py-2"><div><p>{food.name}</p><p className="text-sm text-gray-500">{food.meal}</p></div><div className="flex items-center gap-4"><span>{food.calories} kcal</span><button onClick={() => removeFood(food.id)} className="text-red-500"><Trash2 size={18} /></button></div></li>)}</ul></Card></div>);
};

const WorkoutTracker = () => {
    const { workoutLog, addWorkout, updateWorkout, removeWorkout, activeProfile } = useApp();
    const [activeSession, setActiveSession] = useState('home');
    const [sessionPlans, setSessionPlans] = useState({});

    useEffect(() => {
        const { experienceLevel = 'beginner', fitnessGoal = 'generalFitness' } = activeProfile || {};
        const homePlan = workoutPlans[experienceLevel]?.[fitnessGoal]?.home || [];
        const gymPlan = workoutPlans[experienceLevel]?.[fitnessGoal]?.gym || [];
        const createPlan = (plan, type) => plan.map((task, index) => { const loggedTask = workoutLog.find(w => w.id === `${type}-${task.name}-${index}`); return { ...task, id: `${type}-${task.name}-${index}`, sets: task.reps.map((repCount, i) => ({ id: `${type}-${task.name}-${index}-set-${i}`, reps: repCount, completed: loggedTask?.completedSets?.[i] || false, }))}; });
        setSessionPlans({ home: createPlan(homePlan, 'home'), gym: createPlan(gymPlan, 'gym') });
    }, [activeProfile, workoutLog]);

    const updateTaskInPlan = (taskId, updatedTask) => { setSessionPlans(prev => ({ ...prev, [activeSession]: prev[activeSession].map(t => t.id === taskId ? updatedTask : t) })); };
    const handleToggleSet = (task, setIndex) => { const newSets = [...task.sets]; newSets[setIndex].completed = !newSets[setIndex].completed; updateTaskInPlan(task.id, { ...task, sets: newSets }); recalculateTotalCalories(task.id, newSets); };
    const recalculateTotalCalories = (taskId, sets) => {
        const task = (sessionPlans[activeSession] || []).find(t => t.id === taskId);
        if (!task) return;
        const exerciseInfo = exercises[task.name];
        let totalCalories = 0, completedSetsCount = 0;
        sets.forEach(set => { if (set.completed) { completedSetsCount++; if (exerciseInfo.type === 'reps') { totalCalories += set.reps * (exerciseInfo.caloriesPerRep || 0); } } });
        if (completedSetsCount > 0) {
            const updatedLogEntry = { id: taskId, name: `${task.name} (${completedSetsCount}/${sets.length} sets)`, caloriesBurned: totalCalories, completedSets: sets.map(s => s.completed) };
            if (workoutLog.some(w => w.id === taskId)) { updateWorkout(taskId, updatedLogEntry); }
            else { addWorkout(updatedLogEntry); }
        } else { removeWorkout(taskId); }
    };
    
    const SessionTab = ({ session, icon: Icon }) => (<button onClick={() => setActiveSession(session)} className={`flex-1 flex items-center justify-center gap-2 p-3 font-semibold transition-colors ${activeSession === session ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}><Icon size={20} />{session.charAt(0).toUpperCase() + session.slice(1)}</button>);
    const renderSessionContent = () => {
        const currentPlan = sessionPlans[activeSession] || [];
        return (<Card><ul className="space-y-4">{currentPlan.map((task) => (<li key={task.id} className="p-4 bg-gray-100 rounded-lg"><div className="font-semibold text-lg mb-4">{task.name}</div><div className="space-y-2">{task.sets.map((set, i) => (<div key={set.id} className={`flex items-center gap-3 p-2 rounded-md ${set.completed ? 'bg-green-100' : 'bg-gray-200'}`}><button onClick={() => handleToggleSet(task, i)}>{set.completed ? <CheckSquare size={22} className="text-green-500"/> : <Square size={22} className="text-gray-400"/>}</button><span className="font-semibold text-gray-500 w-12">Set {i+1}</span><input type="number" value={set.reps} className="w-20 p-1.5 text-center rounded-md"/><span className="text-gray-600">{task.unit}</span></div>))}</div></li>))}</ul></Card>);
    };

    return (<div className="space-y-6"><div className="text-center"><h1 className="text-3xl font-bold">Choose Your Workout</h1></div><Card className="p-0"><div className="flex border-b"><SessionTab session="home" icon={Home} /><SessionTab session="gym" icon={Building} /></div><div className="p-4">{renderSessionContent()}</div></Card><Card><h2 className="text-xl font-bold mb-4">Today's Logged Workouts</h2>{workoutLog.length > 0 ? (<ul className="divide-y">{workoutLog.map(log => (<li key={log.id} className="flex justify-between items-center py-2"><span>{log.name}</span><div className="flex items-center gap-3"><span className="font-semibold text-red-500">{log.caloriesBurned.toFixed(0)} kcal</span><button onClick={() => removeWorkout(log.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button></div></li>))}</ul>) : (<p className="text-center text-gray-500 py-4">No workouts logged yet today.</p>)}</Card></div>);
};

const SettingsPage = () => {
    const { activeProfile, updateProfileDetails, goals, updateGoals } = useApp();
    const [localProfile, setLocalProfile] = useState(activeProfile);
    const [localGoals, setLocalGoals] = useState(goals);
    
    useEffect(() => { setLocalProfile(activeProfile); setLocalGoals(goals); }, [activeProfile, goals]);

    if (!localProfile) return null;

    const handleProfileChange = (e) => setLocalProfile(p => ({...p, [e.target.name]: e.target.value}));
    const handleGoalChange = (e) => setLocalGoals(g => ({...g, [e.target.name]: parseInt(e.target.value) || 0}));
    
    const handleSave = () => {
        updateProfileDetails(localProfile);
        updateGoals(localGoals);
        alert("Settings saved!");
    };

    return (<div className="space-y-6 p-4"><h1 className="text-2xl font-bold text-center">Settings for {localProfile.name}</h1><Card><h2 className="text-xl font-bold mb-4">Profile</h2><div className="space-y-2"><label>Name</label><input name="name" value={localProfile.name} onChange={handleProfileChange} className="w-full p-2 border rounded"/></div></Card><Card><h2 className="text-xl font-bold mb-4">Goals</h2><div className="space-y-2"><label>Calories</label><input name="calories" type="number" value={localGoals.calories} onChange={handleGoalChange} className="w-full p-2 border rounded"/></div></Card><button onClick={handleSave} className="w-full bg-blue-500 text-white p-2 rounded">Save All Settings</button></div>);
};

// --- MAIN APP SHELL ---
const AppShell = ({ page, setPage }) => {
    const { activeProfile, userProfiles, setActiveProfileId, logout } = useApp();
    const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

    const renderPage = () => {
        switch (page) {
            case 'dashboard': return <Dashboard />;
            case 'mealLogger': return <MealLogger />;
            case 'workoutTracker': return <WorkoutTracker />;
            case 'settings': return <SettingsPage />;
            default: return <Dashboard />;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-100 font-sans">
          <div className="bg-slate-50">
            <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="font-bold text-lg">Fitness MVP</div>
                <div className="relative">
                    <button onClick={() => setShowProfileSwitcher(s => !s)} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100">
                        <UserCircle />
                        <span>{activeProfile?.name || "Select Profile"}</span>
                    </button>
                    {showProfileSwitcher && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border">
                            {userProfiles.map(p => <div key={p.id} onClick={() => {setActiveProfileId(p.id); setShowProfileSwitcher(false);}} className="p-2 hover:bg-gray-100 cursor-pointer">{p.name}</div>)}
                            <div className="border-t p-2 hover:bg-gray-100 cursor-pointer text-red-500" onClick={logout}><LogOut size={16} className="inline mr-2"/>Logout</div>
                        </div>
                    )}
                </div>
            </header>
            <main className="max-w-4xl mx-auto p-4 pb-28">{renderPage()}</main>
            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t"><nav className="flex justify-around max-w-4xl mx-auto"><NavItem pageName="dashboard" icon={Shield} /><NavItem pageName="mealLogger" icon={Apple} /><NavItem pageName="workoutTracker" icon={Dumbbell} /><NavItem pageName="settings" icon={Settings} /></nav></footer>
        </div>
        </div>
    );
};

const NavItem = ({ pageName, icon: Icon }) => {
    const { setPage, page } = useApp();
    const isActive = page === pageName;
    return (<button onClick={() => setPage(pageName)} className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${isActive ? 'text-blue-500' : 'text-gray-500'}`}><Icon size={24} /><span className="text-xs mt-1 font-medium capitalize">{pageName}</span></button>);
};

// --- ROOT COMPONENT ---
export default function App() {
    return (<AppProvider><MainLayout /></AppProvider>);
}

const MainLayout = () => {
    const { isLoading, authUser, activeProfile, page, setPage } = useApp();

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen"><Loader2 size={48} className="animate-spin text-blue-500"/></div>;
    }

    if (!authUser) {
        return <AuthPage />;
    }

    if (!activeProfile) {
        return <ProfileManagementPage />;
    }

    return <AppShell page={page} setPage={setPage} />;
};
