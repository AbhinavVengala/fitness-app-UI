import React, { useState } from 'react';
import { Dumbbell, Loader2, Sparkles, X, ChevronRight, Activity } from 'lucide-react';
import { workoutPlanApi } from '../api';
import toast from 'react-hot-toast';

const WorkoutPlanGenerator = ({ isOpen, onClose, profileContext }) => {
    const [query, setQuery] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestion, setSuggestion] = useState('');

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!query.trim()) {
            toast.error("Please tell the AI what kind of workout you want (e.g., '30 min dumbbell chest day')");
            return;
        }

        setIsGenerating(true);
        setSuggestion('');

        try {
            const payload = {
                profile: profileContext,
                query: query.trim()
            };

            const response = await workoutPlanApi.generate(payload);
            setSuggestion(response.suggestion);
        } catch (error) {
            toast.error(error.message || 'Failed to generate workout plan. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleQuickPrompt = (promptText) => {
        setQuery(promptText);
    };

    // Render markdown safely
    const renderMarkdown = (text) => {
        if (!text) return null;
        let formattedText = text;
        // Bold
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italics
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Headers
        formattedText = formattedText.replace(/### (.*?)\n/g, '<h3 className="text-lg font-bold mt-4 mb-2">$1</h3>');
        formattedText = formattedText.replace(/## (.*?)\n/g, '<h2 className="text-xl font-bold mt-5 mb-3">$1</h2>');

        // Lists
        const listItems = formattedText.split('\n').map((line, index) => {
            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                const innerHtml = line.replace(/^[\*\-]\s+/, '');
                return `<li key="${index}" class="ml-4 list-disc mb-1">${innerHtml}</li>`;
            }
            if (line.match(/^\d+\.\s/)) {
                const innerHtml = line.replace(/^\d+\.\s+/, '');
                return `<li key="${index}" class="ml-4 list-decimal mb-1 font-semibold">${innerHtml}</li>`;
            }
            return `<p key="${index}" class="mb-2">${line}</p>`;
        }).join('');

        return <div dangerouslySetInnerHTML={{ __html: listItems }} className="text-sm text-foreground/90 space-y-1" />;
    };

    const quickPrompts = [
        "Give me a 30-minute full body dumbbell workout.",
        "Suggest a quick 15-minute core routine.",
        "I need a heavy push day routine for the gym."
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card border border-border rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent rounded-t-3xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Dumbbell className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                AI Workout Coach
                                <Sparkles className="w-4 h-4 text-blue-500" />
                            </h2>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Tailored routines for {profileContext?.fitnessGoal?.replace(/([A-Z])/g, ' $1').toLowerCase() || 'your goal'}.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">

                    {/* Input Area */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            What do you want to train today?
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                placeholder="E.g., I want a 45-min leg workout..."
                                className="flex-1 input-modern bg-background"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !query.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Generate
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Quick Prompts */}
                        {!suggestion && !isGenerating && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {quickPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickPrompt(prompt)}
                                        className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors border border-border"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Results Area */}
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-16 h-16 relative">
                                <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                                <Activity className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <p className="text-muted-foreground font-medium animate-pulse">Building your perfect routine...</p>
                        </div>
                    ) : suggestion ? (
                        <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-blue-600 dark:prose-headings:text-blue-400">
                                {renderMarkdown(suggestion)}
                            </div>
                        </div>
                    ) : null}

                </div>
            </div>
        </div>
    );
};

export default WorkoutPlanGenerator;
