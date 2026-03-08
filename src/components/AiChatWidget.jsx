import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectActiveProfile } from '../store/slices/profileSlice';
import { chatApi } from '../api';
import { Bot, X, Send, Loader2, Sparkles, User } from 'lucide-react';

/**
 * AI Fitness Coach Chat Widget — floating FAB with expandable chat panel.
 * Reads user context from Redux and sends it with each message for personalized responses.
 */
const AiChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // User context from Redux
    const activeProfile = useSelector(selectActiveProfile);
    const { foodLog, workoutLog, goals, waterIntake } = useSelector(state => state.data);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Add welcome message on first open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const name = activeProfile?.name || 'there';
            setMessages([{
                role: 'model',
                text: `Hey ${name}! 👋 I'm your **AI Fitness Coach**. I can see your daily progress and help you with:\n\n- 🍽️ What to eat to hit your macro goals\n- 💪 Workout suggestions & form tips\n- 📊 Analyzing your progress\n- 💧 Hydration reminders\n\nWhat would you like help with?`,
            }]);
        }
    }, [isOpen]);

    const buildContext = () => {
        const totalCalories = foodLog.reduce((sum, f) => sum + (f.calories || 0), 0);
        const totalProtein = foodLog.reduce((sum, f) => sum + (f.protein || 0), 0);
        const totalCarbs = foodLog.reduce((sum, f) => sum + (f.carbs || 0), 0);
        const totalFats = foodLog.reduce((sum, f) => sum + (f.fats || 0), 0);
        const caloriesBurned = workoutLog.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

        return {
            profile: activeProfile ? {
                name: activeProfile.name,
                age: activeProfile.age,
                weight: activeProfile.weight,
                height: activeProfile.height,
                gender: activeProfile.gender,
                fitnessGoal: activeProfile.fitnessGoal,
                experienceLevel: activeProfile.experienceLevel,
            } : null,
            todayStats: {
                goals,
                totalCalories,
                totalProtein,
                totalCarbs,
                totalFats,
                waterIntake,
                caloriesBurned,
                foodLog: foodLog.map(f => ({ name: f.name, calories: f.calories, meal: f.meal })),
                workoutLog: workoutLog.map(w => ({ exerciseName: w.exerciseName, caloriesBurned: w.caloriesBurned, duration: w.duration })),
            },
        };
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Build history (exclude the welcome message for API, map to expected format)
            const history = messages
                .map(m => ({ role: m.role, text: m.text }));

            const context = buildContext();
            const response = await chatApi.send(userMessage.text, history, context);

            setMessages(prev => [...prev, { role: 'model', text: response.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'model',
                text: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🔄",
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Simple markdown-ish rendering for bold and bullet points
    const renderMessageText = (text) => {
        return text.split('\n').map((line, i) => {
            // Replace **bold** with <strong>
            let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Replace *italic* with <em>
            formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

            const isBullet = formatted.startsWith('- ') || formatted.startsWith('• ');
            if (isBullet) {
                formatted = formatted.replace(/^[-•]\s/, '');
                return (
                    <div key={i} className="flex gap-2 ml-1">
                        <span className="text-primary mt-0.5 shrink-0">•</span>
                        <span dangerouslySetInnerHTML={{ __html: formatted }} />
                    </div>
                );
            }

            return (
                <p key={i} className={`${line === '' ? 'h-2' : ''}`}
                    dangerouslySetInnerHTML={{ __html: formatted }} />
            );
        });
    };

    return (
        <>
            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[70vh] z-[70] animate-in fade-in slide-in-from-bottom-5 duration-300 flex flex-col rounded-2xl shadow-2xl border border-border overflow-hidden bg-white dark:bg-slate-900">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-base">FitCoach AI</h3>
                                <p className="text-white/70 text-xs">Your personal fitness coach</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[50vh] scrollbar-thin">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'model' && (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 mt-1">
                                        <Sparkles className="w-3.5 h-3.5 text-white" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-br-md'
                                        : 'bg-muted text-foreground rounded-bl-md'
                                        }`}
                                >
                                    {msg.role === 'model'
                                        ? renderMessageText(msg.text)
                                        : <p>{msg.text}</p>
                                    }
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                        <User className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="flex gap-2.5 justify-start">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md">
                                    <div className="flex gap-1.5 items-center">
                                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-border p-3 shrink-0 bg-background">
                        <div className="flex gap-2 items-end">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask your fitness coach..."
                                rows={1}
                                className="flex-1 resize-none rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                style={{ maxHeight: '100px' }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="p-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            >
                                {isLoading
                                    ? <Loader2 className="w-5 h-5 animate-spin" />
                                    : <Send className="w-5 h-5" />
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FAB Button */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[70] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen
                    ? 'bg-muted text-muted-foreground hover:bg-muted/80 rotate-0'
                    : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700'
                    }`}
                title="AI Fitness Coach"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <Bot className="w-7 h-7" />
                        {/* Pulse ring */}
                        <span className="absolute inset-0 rounded-full bg-violet-500/30 animate-ping" style={{ animationDuration: '3s' }} />
                    </>
                )}
            </button>
        </>
    );
};

export default AiChatWidget;
