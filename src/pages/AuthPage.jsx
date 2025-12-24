import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
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
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 -z-10" />

            {/* Theme Toggle - Top Right */}
            <div className="absolute top-6 right-6 z-20">
                <ThemeToggle className="bg-background/50 hover:bg-background/80 backdrop-blur-md text-foreground" />
            </div>

            {/* Auth Card */}
            <div className="w-full max-w-md p-8 sm:p-10 animate-in relative z-10 bg-card border border-border rounded-3xl shadow-2xl shadow-primary/5">
                {/* Logo/Brand */}
                <div className="text-center mb-8 px-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-primary-foreground mb-5 shadow-lg shadow-primary/30 transform hover:scale-105 transition-transform duration-300">
                        <Dumbbell className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight text-foreground text-balance">
                        Fitness Tracker
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm sm:text-base text-balance">
                        {isRegisterMode ? 'Start your fitness journey' : 'Welcome back, champion'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegisterMode && (
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="input-modern bg-background !pl-14"
                            />
                        </div>
                    )}

                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Mail className="w-5 h-5" />
                        </div>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="input-modern bg-background !pl-14"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="input-modern bg-background !pl-14"
                            required
                        />
                    </div>

                    <div className="flex justify-end mt-2 mb-4">
                        <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                            Forgot Password?
                        </Link>
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
                        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center">
                            <p className="text-destructive text-sm font-medium">{error}</p>
                        </div>
                    )}
                </form>

                {/* Toggle Link */}
                <div className="mt-8 pt-6 border-t border-border text-center">
                    <p className="text-muted-foreground text-sm mb-2">
                        {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
                    </p>
                    <button
                        onClick={toggleMode}
                        className="text-primary font-bold hover:underline transition-colors text-sm"
                    >
                        {isRegisterMode ? 'Sign in instead' : 'Create one now →'}
                    </button>
                </div>
            </div>

            {/* Bottom attribution */}
            <div className="absolute bottom-4 text-center text-muted-foreground text-xs font-medium">
                Your personal fitness companion
            </div>
        </div>
    );
};

export default AuthPage;

