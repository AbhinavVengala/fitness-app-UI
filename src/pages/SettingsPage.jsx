import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/Card';
import { Loader2, Save, User, Target } from 'lucide-react';
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
        <div className="max-w-4xl mx-auto space-y-8 animate-in pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your profile and usage targets</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary flex items-center gap-2"
                >
                    {isSaving ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            <Save size={20} />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Profile Section */}
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Profile Information</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Display Name</label>
                            <input
                                name="name"
                                value={localProfile.name || ''}
                                onChange={handleProfileChange}
                                className="input-modern bg-background"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Age</label>
                                <input
                                    name="age"
                                    type="number"
                                    value={localProfile.age || ''}
                                    onChange={handleProfileChange}
                                    className="input-modern bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Weight (kg)</label>
                                <input
                                    name="weight"
                                    type="number"
                                    value={localProfile.weight || ''}
                                    onChange={handleProfileChange}
                                    className="input-modern bg-background"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Goals Section */}
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Daily Goals</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Daily Calories</label>
                            <input
                                name="calories"
                                type="number"
                                value={localGoals.calories || ''}
                                onChange={handleGoalChange}
                                className="input-modern bg-background"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Protein (g)</label>
                                <input
                                    name="protein"
                                    type="number"
                                    value={localGoals.protein || ''}
                                    onChange={handleGoalChange}
                                    className="input-modern bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Carbs (g)</label>
                                <input
                                    name="carbs"
                                    type="number"
                                    value={localGoals.carbs || ''}
                                    onChange={handleGoalChange}
                                    className="input-modern bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Fats (g)</label>
                                <input
                                    name="fats"
                                    type="number"
                                    value={localGoals.fats || ''}
                                    onChange={handleGoalChange}
                                    className="input-modern bg-background"
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-center font-medium animate-in fade-in slide-in-from-bottom-2 ${message.type === 'success'
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                        : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default SettingsPage;