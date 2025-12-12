import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, UserPlus, LogIn, Mail, Lock, User, Dumbbell } from 'lucide-react';
import { login, register, clearError } from '../store/slices/authSlice';
import ThemeToggle from '../components/ThemeToggle';

const AuthPage = () => {
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector(state => state.auth);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(clearError());

        if (isRegisterMode) {
            dispatch(register({ email, password, name: name || 'User' }));
        } else {
            dispatch(login({ email, password }));
        }
    };

    const toggleMode = () => {
        setIsRegisterMode(!isRegisterMode);
        dispatch(clearError());
    };

    return (
        <div className="min-h-screen gradient-bg-animated flex items-center justify-center p-4 relative overflow-hidden">
            {/* Floating decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Large blur circles */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-indigo-300/15 rounded-full blur-2xl"></div>

                {/* Small floating dots */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
                <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-white/30 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{ animationDuration: '5s' }}></div>
            </div>

            {/* Theme Toggle - Top Right */}
            <div className="absolute top-6 right-6 z-20">
                <ThemeToggle className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white" />
            </div>

            {/* Auth Card */}
            <div className="glass-card w-full max-w-md p-8 sm:p-10 animate-in relative z-10">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-5 shadow-2xl shadow-purple-500/30 transform hover:scale-105 transition-transform duration-300">
                        <Dumbbell className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold mb-2 tracking-tight text-gray-800" style={{ color: 'var(--title-color, #1f2937)' }}>
                        Fitness Tracker
                    </h1>
                    <p className="text-gray-500 dark:text-gray-300 font-medium">
                        {isRegisterMode ? 'Start your fitness journey' : 'Welcome back, champion'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegisterMode && (
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="input-modern"
                            />
                        </div>
                    )}

                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                            <Mail className="w-5 h-5" />
                        </div>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="input-modern"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="input-modern"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full mt-6"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isRegisterMode ? (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Create Account
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Sign In
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-xl p-4 text-center">
                            <p className="text-red-600 dark:text-red-300 text-sm font-medium">{error}</p>
                        </div>
                    )}
                </form>

                {/* Toggle Link */}
                <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                        {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
                    </p>
                    <button
                        onClick={toggleMode}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors text-sm"
                    >
                        {isRegisterMode ? 'Sign in instead' : 'Create one now →'}
                    </button>
                </div>
            </div>

            {/* Bottom attribution */}
            <div className="absolute bottom-4 text-center text-white/50 text-xs font-medium">
                Your personal fitness companion
            </div>
        </div>
    );
};

export default AuthPage;

