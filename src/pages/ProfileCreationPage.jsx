import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Target, Scale, Ruler, Calendar, Dumbbell, ArrowRight, Loader2 } from 'lucide-react';
import { profileApi } from '../api';
import { loadUserProfiles, setActiveProfileId, selectUserId } from '../store/slices/profileSlice';

const ProfileCreationPage = () => {
    const dispatch = useDispatch();
    const userId = useSelector(selectUserId);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        weight: '',
        height: '',
        gender: 'male',
        fitnessGoal: 'generalFitness',
        experienceLevel: 'beginner',
        goals: {
            calories: 2000,
            protein: 100,
            carbs: 200,
            fats: 65,
            water: 8
        }
    });

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateGoal = (field, value) => {
        setFormData(prev => ({
            ...prev,
            goals: { ...prev.goals, [field]: parseInt(value) || 0 }
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');

        try {
            // Create profile via API
            const newProfile = await profileApi.createProfile(userId, {
                ...formData,
                age: parseInt(formData.age) || 25,
                weight: parseFloat(formData.weight) || 70,
                height: parseFloat(formData.height) || 170,
                waterIntake: 0
            });

            // Reload profiles and set the new one as active
            const profiles = await profileApi.getProfiles(userId);
            dispatch(loadUserProfiles(profiles));
            dispatch(setActiveProfileId(newProfile.id));
        } catch (err) {
            setError(err.message || 'Failed to create profile');
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && !formData.name.trim()) {
            setError('Please enter your name');
            return;
        }
        setError('');
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-background to-secondary/10 -z-10" />

            <div className="w-full max-w-lg p-8 animate-in bg-card border border-border rounded-2xl shadow-xl">
                {/* Progress indicator */}
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-primary w-8' :
                                i < step ? 'bg-primary/60 w-2' : 'bg-muted w-2'
                                }`}
                        />
                    ))}
                </div>

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                <User className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Let's set up your profile</h2>
                            <p className="text-muted-foreground mt-2">Tell us a bit about yourself</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Your Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => updateField('name', e.target.value)}
                                    placeholder="Enter your name"
                                    className="input-modern bg-background"
                                    style={{ paddingLeft: '1rem' }}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Age</label>
                                    <input
                                        type="number"
                                        value={formData.age}
                                        onChange={e => updateField('age', e.target.value)}
                                        placeholder="25"
                                        className="input-modern bg-background"
                                        style={{ paddingLeft: '1rem' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={e => updateField('gender', e.target.value)}
                                        className="input-modern bg-background"
                                        style={{ paddingLeft: '1rem' }}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={formData.weight}
                                        onChange={e => updateField('weight', e.target.value)}
                                        placeholder="70"
                                        className="input-modern bg-background"
                                        style={{ paddingLeft: '1rem' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Height (cm)</label>
                                    <input
                                        type="number"
                                        value={formData.height}
                                        onChange={e => updateField('height', e.target.value)}
                                        placeholder="170"
                                        className="input-modern bg-background"
                                        style={{ paddingLeft: '1rem' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Fitness Goals */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-green-100 flex items-center justify-center mb-4 dark:bg-green-900/20">
                                <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">What's your goal?</h2>
                            <p className="text-muted-foreground mt-2">Choose your fitness objective</p>
                        </div>

                        <div className="space-y-3">
                            {[
                                { value: 'weightLoss', label: 'Lose Weight', desc: 'Burn fat and get lean', emoji: '🔥' },
                                { value: 'muscleGain', label: 'Build Muscle', desc: 'Gain strength and size', emoji: '💪' },
                                { value: 'generalFitness', label: 'Stay Fit', desc: 'Maintain overall health', emoji: '✨' },
                                { value: 'endurance', label: 'Build Endurance', desc: 'Improve cardio and stamina', emoji: '🏃' }
                            ].map(goal => {
                                const isSelected = formData.fitnessGoal === goal.value;
                                return (
                                    <button
                                        key={goal.value}
                                        onClick={() => updateField('fitnessGoal', goal.value)}
                                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-4 border ${isSelected
                                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                            : 'bg-background hover:bg-muted border-border'
                                            }`}
                                    >
                                        <span className="text-2xl">{goal.emoji}</span>
                                        <div>
                                            <div className="font-semibold">{goal.label}</div>
                                            <div className={`text-sm ${isSelected ? 'opacity-90' : 'text-muted-foreground'}`}>
                                                {goal.desc}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Experience Level</label>
                            <select
                                value={formData.experienceLevel}
                                onChange={e => updateField('experienceLevel', e.target.value)}
                                className="input-modern bg-background"
                                style={{ paddingLeft: '1rem' }}
                            >
                                <option value="beginner">Beginner (0-1 years)</option>
                                <option value="intermediate">Intermediate (1-3 years)</option>
                                <option value="advanced">Advanced (3+ years)</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Step 3: Daily Targets */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                                <Dumbbell className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Set your daily targets</h2>
                            <p className="text-muted-foreground mt-2">You can adjust these anytime</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Daily Calories</label>
                                <input
                                    type="number"
                                    value={formData.goals.calories}
                                    onChange={e => updateGoal('calories', e.target.value)}
                                    className="input-modern bg-background"
                                    style={{ paddingLeft: '1rem' }}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Protein (g)</label>
                                    <input
                                        type="number"
                                        value={formData.goals.protein}
                                        onChange={e => updateGoal('protein', e.target.value)}
                                        className="input-modern bg-background"
                                        style={{ paddingLeft: '1rem' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Carbs (g)</label>
                                    <input
                                        type="number"
                                        value={formData.goals.carbs}
                                        onChange={e => updateGoal('carbs', e.target.value)}
                                        className="input-modern bg-background"
                                        style={{ paddingLeft: '1rem' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Fats (g)</label>
                                    <input
                                        type="number"
                                        value={formData.goals.fats}
                                        onChange={e => updateGoal('fats', e.target.value)}
                                        className="input-modern bg-background"
                                        style={{ paddingLeft: '1rem' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Water (glasses/day)</label>
                                <input
                                    type="number"
                                    value={formData.goals.water}
                                    onChange={e => updateGoal('water', e.target.value)}
                                    className="input-modern bg-background"
                                    style={{ paddingLeft: '1rem' }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-center">
                        <p className="text-destructive text-sm">{error}</p>
                    </div>
                )}

                {/* Navigation buttons */}
                <div className="flex gap-3 mt-8">
                    {step > 1 && (
                        <button
                            onClick={prevStep}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold bg-muted text-foreground hover:bg-muted/80 transition-colors"
                        >
                            Back
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={nextStep}
                            className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                            Next
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Profile
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileCreationPage;
