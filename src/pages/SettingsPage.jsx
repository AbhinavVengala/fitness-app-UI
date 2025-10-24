import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/Card';
import { updateProfileDetails, updateGoals } from '../store/slices/dataSlice';
import { selectActiveProfile } from '../store/slices/profileSlice';

const SettingsPage = () => {
    const dispatch = useDispatch();
    const { authUser } = useSelector(state => state.auth);
    const activeProfile = useSelector(selectActiveProfile);
    const { goals } = useSelector(state => state.data);

    const [localProfile, setLocalProfile] = useState(activeProfile);
    const [localGoals, setLocalGoals] = useState(goals);
    
    useEffect(() => { 
        setLocalProfile(activeProfile); 
        setLocalGoals(goals); 
    }, [activeProfile, goals]);

    if (!localProfile) return null;

    const handleProfileChange = (e) => setLocalProfile(p => ({...p, [e.target.name]: e.target.value}));
    const handleGoalChange = (e) => setLocalGoals(g => ({...g, [e.target.name]: parseInt(e.target.value) || 0}));
    
    const handleSave = () => {
        dispatch(updateProfileDetails({ authUser, profileId: activeProfile.id, newDetails: localProfile }));
        dispatch(updateGoals({ authUser, profileId: activeProfile.id, newGoals: localGoals }));
        alert("Settings saved!");
    };

    return (<div className="space-y-6 p-4"><h1 className="text-2xl font-bold text-center">Settings for {localProfile.name}</h1><Card><h2 className="text-xl font-bold mb-4">Profile</h2><div className="space-y-2"><label>Name</label><input name="name" value={localProfile.name} onChange={handleProfileChange} className="w-full p-2 border rounded"/></div></Card><Card><h2 className="text-xl font-bold mb-4">Goals</h2><div className="space-y-2"><label>Calories</label><input name="calories" type="number" value={localGoals.calories} onChange={handleGoalChange} className="w-full p-2 border rounded"/></div></Card><button onClick={handleSave} className="w-full bg-blue-500 text-white p-2 rounded">Save All Settings</button></div>);
};

export default SettingsPage;