import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/Card';
import { Loader2, Save, User, Target, Trash2, AlertTriangle } from 'lucide-react';
import { updateGoalsAsync } from '../store/slices/dataSlice';
import { selectActiveProfile, selectUserId, updateProfileInStore } from '../store/slices/profileSlice';
import { profileApi, apiFetch } from '../api';
import { logout, resetProfile, resetData } from '../store/slices/authSlice';
import { resetData as resetDataSlice } from '../store/slices/dataSlice';
import toast from 'react-hot-toast';

// Validation helpers
const validateProfile = (profile) => {
    const errors = {};
    if (!profile.name?.trim()) errors.name = 'Name is required';
    const age = parseInt(profile.age);
    if (isNaN(age) || age < 10 || age > 100) errors.age = 'Age must be between 10 and 100';
    const weight = parseFloat(profile.weight);
    if (isNaN(weight) || weight < 20 || weight > 300) errors.weight = 'Weight must be between 20–300 kg';
    return errors;
};

const validateGoals = (goals) => {
    const errors = {};
    const cal = parseInt(goals.calories);
    if (isNaN(cal) || cal < 500 || cal > 10000) errors.calories = 'Calories must be 500–10,000';
    const protein = parseInt(goals.protein);
    if (isNaN(protein) || protein < 10 || protein > 500) errors.protein = 'Protein must be 10–500 g';
    return errors;
};

const SettingsPage = () => {
    const dispatch = useDispatch();
    const userId = useSelector(selectUserId);
    const activeProfile = useSelector(selectActiveProfile);
    const { goals } = useSelector(state => state.data);

    const [localProfile, setLocalProfile] = useState(activeProfile);
    const [localGoals, setLocalGoals] = useState(goals);
    const [isSaving, setIsSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Account deletion state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setLocalProfile(activeProfile);
        setLocalGoals(goals);
    }, [activeProfile, goals]);

    if (!localProfile) return null;

    const handleProfileChange = (e) => {
        setLocalProfile(p => ({ ...p, [e.target.name]: e.target.value }));
        // Clear validation error on change
        if (validationErrors[e.target.name]) {
            setValidationErrors(v => ({ ...v, [e.target.name]: null }));
        }
    };

    const handleGoalChange = (e) => {
        setLocalGoals(g => ({ ...g, [e.target.name]: parseInt(e.target.value) || 0 }));
        if (validationErrors[e.target.name]) {
            setValidationErrors(v => ({ ...v, [e.target.name]: null }));
        }
    };

    const handleSave = async () => {
        // Validate before saving
        const profileErrors = validateProfile(localProfile);
        const goalErrors = validateGoals(localGoals);
        const allErrors = { ...profileErrors, ...goalErrors };

        if (Object.keys(allErrors).length > 0) {
            setValidationErrors(allErrors);
            toast.error('Please fix the highlighted errors before saving.');
            return;
        }

        setIsSaving(true);
        try {
            await profileApi.updateProfile(userId, activeProfile.id, localProfile);
            await dispatch(updateGoalsAsync({
                userId,
                profileId: activeProfile.id,
                goals: localGoals
            })).unwrap();

            dispatch(updateProfileInStore({
                profileId: activeProfile.id,
                updates: { ...localProfile, goals: localGoals }
            }));

            toast.success('Settings saved successfully!');
        } catch (error) {
            toast.error(error.message || 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;

        setIsDeleting(true);
        try {
            await apiFetch(`/auth/delete-account`, { method: 'DELETE' });
            toast.success('Account deleted. We\'re sorry to see you go.');
            // Clear all state and redirect to landing
            dispatch(logout());
            dispatch(resetProfile());
            dispatch(resetDataSlice());
        } catch (error) {
            toast.error(error.message || 'Failed to delete account. Please try again or contact support@paceplate.in');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const inputClass = (field) =>
        `input-modern bg-background ${validationErrors[field] ? 'border-destructive ring-1 ring-destructive' : ''}`;

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
                                className={inputClass('name')}
                                placeholder="Your name"
                            />
                            {validationErrors.name && <p className="text-destructive text-xs mt-1">{validationErrors.name}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Age</label>
                                <input
                                    name="age"
                                    type="number"
                                    min="10"
                                    max="100"
                                    value={localProfile.age || ''}
                                    onChange={handleProfileChange}
                                    className={inputClass('age')}
                                    placeholder="25"
                                />
                                {validationErrors.age && <p className="text-destructive text-xs mt-1">{validationErrors.age}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Weight (kg)</label>
                                <input
                                    name="weight"
                                    type="number"
                                    min="20"
                                    max="300"
                                    value={localProfile.weight || ''}
                                    onChange={handleProfileChange}
                                    className={inputClass('weight')}
                                    placeholder="70"
                                />
                                {validationErrors.weight && <p className="text-destructive text-xs mt-1">{validationErrors.weight}</p>}
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
                                min="500"
                                max="10000"
                                value={localGoals.calories || ''}
                                onChange={handleGoalChange}
                                className={inputClass('calories')}
                                placeholder="2000"
                            />
                            {validationErrors.calories && <p className="text-destructive text-xs mt-1">{validationErrors.calories}</p>}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Protein (g)</label>
                                <input
                                    name="protein"
                                    type="number"
                                    min="10"
                                    max="500"
                                    value={localGoals.protein || ''}
                                    onChange={handleGoalChange}
                                    className={inputClass('protein')}
                                />
                                {validationErrors.protein && <p className="text-destructive text-xs mt-1">{validationErrors.protein}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Carbs (g)</label>
                                <input
                                    name="carbs"
                                    type="number"
                                    min="0"
                                    max="1000"
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
                                    min="0"
                                    max="500"
                                    value={localGoals.fats || ''}
                                    onChange={handleGoalChange}
                                    className="input-modern bg-background"
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Danger Zone */}
            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Danger Zone</h2>
                        <p className="text-sm text-muted-foreground">Irreversible actions — proceed with caution</p>
                    </div>
                </div>

                <div className="border border-destructive/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="font-medium text-foreground">Delete Account</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Permanently deletes your account and all health data. This cannot be undone.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="shrink-0 px-4 py-2 rounded-xl border border-destructive text-destructive hover:bg-destructive hover:text-white transition-all text-sm font-medium flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        Delete Account
                    </button>
                </div>
            </Card>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                            <Trash2 className="w-6 h-6 text-destructive" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Delete Account?</h3>
                        <p className="text-muted-foreground text-sm mb-6">
                            This will <strong className="text-foreground">permanently delete</strong> your PacePlate account, all profiles, food logs, workout history, and personal data. This action <strong className="text-destructive">cannot be reversed</strong>.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-foreground mb-2">
                                To confirm, type <span className="font-mono font-bold text-destructive">DELETE</span> below:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={e => setDeleteConfirmText(e.target.value)}
                                className="input-modern bg-background w-full"
                                placeholder="Type DELETE to confirm"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                                className="flex-1 py-3 rounded-xl bg-muted text-foreground font-semibold hover:bg-muted/80 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                                className="flex-1 py-3 rounded-xl bg-destructive text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                Delete Forever
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;