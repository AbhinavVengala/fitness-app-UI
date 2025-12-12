import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/Card';
import { Loader2, Save } from 'lucide-react';
import { updateGoalsAsync } from '../store/slices/dataSlice';
import { selectActiveProfile, selectUserId, updateProfileInStore } from '../store/slices/profileSlice';
import { profileApi } from '../api';

const SettingsPage = () => {
    const dispatch = useDispatch();
    const userId = useSelector(selectUserId);
    const activeProfile = useSelector(selectActiveProfile);
    const { goals } = useSelector(state => state.data);

    const [localProfile, setLocalProfile] = useState(activeProfile);
    const [localGoals, setLocalGoals] = useState(goals);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        setLocalProfile(activeProfile);
        setLocalGoals(goals);
    }, [activeProfile, goals]);

    if (!localProfile) return null;

    const handleProfileChange = (e) => {
        setLocalProfile(p => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleGoalChange = (e) => {
        setLocalGoals(g => ({ ...g, [e.target.name]: parseInt(e.target.value) || 0 }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);

        try {
            // Update profile via API
            await profileApi.updateProfile(userId, activeProfile.id, localProfile);

            // Update goals via API (through async thunk)
            await dispatch(updateGoalsAsync({
                userId,
                profileId: activeProfile.id,
                goals: localGoals
            })).unwrap();

            // Update local store
            dispatch(updateProfileInStore({
                profileId: activeProfile.id,
                updates: { ...localProfile, goals: localGoals }
            }));

            setMessage({ type: 'success', text: 'Settings saved successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-center">Settings for {localProfile.name}</h1>

            <Card>
                <h2 className="text-xl font-bold mb-4">Profile</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            name="name"
                            value={localProfile.name || ''}
                            onChange={handleProfileChange}
                            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Age</label>
                            <input
                                name="age"
                                type="number"
                                value={localProfile.age || ''}
                                onChange={handleProfileChange}
                                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                            <input
                                name="weight"
                                type="number"
                                value={localProfile.weight || ''}
                                onChange={handleProfileChange}
                                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">Daily Goals</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Calories</label>
                        <input
                            name="calories"
                            type="number"
                            value={localGoals.calories || ''}
                            onChange={handleGoalChange}
                            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Protein (g)</label>
                        <input
                            name="protein"
                            type="number"
                            value={localGoals.protein || ''}
                            onChange={handleGoalChange}
                            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Carbs (g)</label>
                        <input
                            name="carbs"
                            type="number"
                            value={localGoals.carbs || ''}
                            onChange={handleGoalChange}
                            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Fats (g)</label>
                        <input
                            name="fats"
                            type="number"
                            value={localGoals.fats || ''}
                            onChange={handleGoalChange}
                            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>
                </div>
            </Card>

            {message && (
                <div className={`p-3 rounded text-center ${message.type === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center gap-2"
            >
                {isSaving ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : (
                    <>
                        <Save size={20} />
                        Save All Settings
                    </>
                )}
            </button>
        </div>
    );
};

export default SettingsPage;