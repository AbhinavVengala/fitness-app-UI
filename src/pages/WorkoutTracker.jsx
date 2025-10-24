import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/Card';
import { Home, Building, Trash2, CheckSquare, Square } from 'lucide-react';
import { exercises, workoutPlans } from '../data/database';
import { addWorkout, updateWorkout, removeWorkout } from '../store/slices/dataSlice';
import { selectActiveProfile } from '../store/slices/profileSlice';

const WorkoutTracker = () => {
    const dispatch = useDispatch();
    const { workoutLog } = useSelector(state => state.data);
    const { authUser } = useSelector(state => state.auth);
    const activeProfile = useSelector(selectActiveProfile);
    const [activeSession, setActiveSession] = useState('home');
    const [sessionPlans, setSessionPlans] = useState({});

    useEffect(() => {
        if (!activeProfile) return;
        const { experienceLevel = 'beginner', fitnessGoal = 'generalFitness' } = activeProfile;
        const homePlan = workoutPlans[experienceLevel]?.[fitnessGoal]?.home || [];
        const gymPlan = workoutPlans[experienceLevel]?.[fitnessGoal]?.gym || [];
        const createPlan = (plan, type) => plan.map((task, index) => { 
            const loggedTask = workoutLog.find(w => w.id === `${type}-${task.name}-${index}`); 
            return { 
                ...task, 
                id: `${type}-${task.name}-${index}`, 
                sets: task.reps.map((repCount, i) => ({ 
                    id: `${type}-${task.name}-${index}-set-${i}`, 
                    reps: repCount, 
                    completed: loggedTask?.completedSets?.[i] || false, 
                }))
            };
        });
        setSessionPlans({ home: createPlan(homePlan, 'home'), gym: createPlan(gymPlan, 'gym') });
    }, [activeProfile, workoutLog]);

    const updateTaskInPlan = (taskId, updatedTask) => { 
        setSessionPlans(prev => ({ ...prev, [activeSession]: prev[activeSession].map(t => t.id === taskId ? updatedTask : t) })); 
    };

    const handleToggleSet = (task, setIndex) => { 
        const newSets = [...task.sets]; 
        newSets[setIndex].completed = !newSets[setIndex].completed; 
        updateTaskInPlan(task.id, { ...task, sets: newSets }); 
        recalculateTotalCalories(task.id, newSets); 
    };

    const recalculateTotalCalories = (taskId, sets) => {
        const task = (sessionPlans[activeSession] || []).find(t => t.id === taskId);
        if (!task) return;
        const exerciseInfo = exercises[task.name];
        let totalCalories = 0, completedSetsCount = 0;
        sets.forEach(set => { 
            if (set.completed) { 
                completedSetsCount++; 
                if (exerciseInfo.type === 'reps') { 
                    totalCalories += set.reps * (exerciseInfo.caloriesPerRep || 0); 
                } 
            } 
        });

        const payload = { authUser, profileId: activeProfile.id, workoutId: taskId };

        if (completedSetsCount > 0) {
            const updatedLogEntry = { id: taskId, name: `${task.name} (${completedSetsCount}/${sets.length} sets)`, caloriesBurned: totalCalories, completedSets: sets.map(s => s.completed) };
            if (workoutLog.some(w => w.id === taskId)) { 
                dispatch(updateWorkout({ ...payload, updatedData: updatedLogEntry }));
            } else { 
                dispatch(addWorkout({ authUser, profileId: activeProfile.id, workout: updatedLogEntry }));
            }
        } else { 
            dispatch(removeWorkout(payload));
        }
    };
    
    const SessionTab = ({ session, icon: Icon }) => (<button onClick={() => setActiveSession(session)} className={`flex-1 flex items-center justify-center gap-2 p-3 font-semibold transition-colors ${activeSession === session ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}><Icon size={20} />{session.charAt(0).toUpperCase() + session.slice(1)}</button>);
    
    const renderSessionContent = () => {
        const currentPlan = sessionPlans[activeSession] || [];
        return (<Card><ul className="space-y-4">{currentPlan.map((task) => (<li key={task.id} className="p-4 bg-gray-100 rounded-lg"><div className="font-semibold text-lg mb-4">{task.name}</div><div className="space-y-2">{task.sets.map((set, i) => (<div key={set.id} className={`flex items-center gap-3 p-2 rounded-md ${set.completed ? 'bg-green-100' : 'bg-gray-200'}`}><button onClick={() => handleToggleSet(task, i)}>{set.completed ? <CheckSquare size={22} className="text-green-500"/> : <Square size={22} className="text-gray-400"/>}</button><span className="font-semibold text-gray-500 w-12">Set {i+1}</span><input type="number" value={set.reps} className="w-20 p-1.5 text-center rounded-md" readOnly/><span className="text-gray-600">{task.unit}</span></div>))}</div></li>))}</ul></Card>);
    };

    return (<div className="space-y-6"><div className="text-center"><h1 className="text-3xl font-bold">Choose Your Workout</h1></div><Card className="p-0"><div className="flex border-b"><SessionTab session="home" icon={Home} /><SessionTab session="gym" icon={Building} /></div><div className="p-4">{renderSessionContent()}</div></Card><Card><h2 className="text-xl font-bold mb-4">Today's Logged Workouts</h2>{workoutLog.length > 0 ? (<ul className="divide-y">{workoutLog.map(log => (<li key={log.id} className="flex justify-between items-center py-2"><span>{log.name}</span><div className="flex items-center gap-3"><span className="font-semibold text-red-500">{log.caloriesBurned.toFixed(0)} kcal</span><button onClick={() => dispatch(removeWorkout({ authUser, profileId: activeProfile.id, workoutId: log.id }))} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button></div></li>))}</ul>) : (<p className="text-center text-gray-500 py-4">No workouts logged yet today.</p>)}</Card></div>);
};

export default WorkoutTracker;