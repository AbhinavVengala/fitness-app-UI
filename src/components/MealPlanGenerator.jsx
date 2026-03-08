import React, { useState } from 'react';
import { ChefHat, Loader2, Sparkles, X, ChevronRight, Apple } from 'lucide-react';
import { mealPlanApi } from '../api';
import toast from 'react-hot-toast';

const MealPlanGenerator = ({ isOpen, onClose, profileContext, currentLogContext }) => {
    const [query, setQuery] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestion, setSuggestion] = useState('');

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!query.trim()) {
            toast.error("Please tell the AI what you're looking for (e.g., 'A quick high protein snack')");
            return;
        }

        setIsGenerating(true);
        setSuggestion('');

        try {
            const payload = {
                profile: profileContext,
                currentLog: currentLogContext,
                query: query.trim()
            };

            const response = await mealPlanApi.generate(payload);
            setSuggestion(response.suggestion);
        } catch (error) {
            toast.error(error.message || 'Failed to generate meal plan. Please try again.');
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
                // Ensure bold tags inside lists are preserved and not doubly escaped
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
        "Suggest a quick high-protein dinner.",
        "What's a healthy sweet snack that fits my macros?",
        "I need a pre-workout meal suggestion."
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card border border-border rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent rounded-t-3xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                AI Meal Plan Generator
                                <Sparkles className="w-4 h-4 text-amber-500" />
                            </h2>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Personalized recipes based on your exact remaining macros.
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

                    {/* Context Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-muted/50 p-3 rounded-xl border border-border">
                            <div className="text-xs text-muted-foreground mb-1 font-medium">Remaining Cals</div>
                            <div className="font-bold text-foreground">{currentLogContext.remainingCalories} <span className="text-xs font-normal">kcal</span></div>
                        </div>
                        <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium">Remaining Protein</div>
                            <div className="font-bold text-blue-700 dark:text-blue-300">{currentLogContext.remainingProtein} <span className="text-xs font-normal">g</span></div>
                        </div>
                        <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                            <div className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium">Remaining Carbs</div>
                            <div className="font-bold text-green-700 dark:text-green-300">{currentLogContext.remainingCarbs} <span className="text-xs font-normal">g</span></div>
                        </div>
                        <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
                            <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1 font-medium">Remaining Fats</div>
                            <div className="font-bold text-yellow-700 dark:text-yellow-300">{currentLogContext.remainingFats} <span className="text-xs font-normal">g</span></div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            What are you craving?
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                placeholder="E.g., I need a high-protein dinner with chicken..."
                                className="flex-1 input-modern bg-background"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !query.trim()}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
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
                                <div className="absolute inset-0 border-4 border-orange-200 rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 border-4 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
                                <Apple className="w-6 h-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <p className="text-muted-foreground font-medium animate-pulse">Cooking up exactly what you need...</p>
                        </div>
                    ) : suggestion ? (
                        <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-orange-600 dark:prose-headings:text-orange-400">
                                {renderMarkdown(suggestion)}
                            </div>
                        </div>
                    ) : null}

                </div>
            </div>
        </div>
    );
};

export default MealPlanGenerator;
