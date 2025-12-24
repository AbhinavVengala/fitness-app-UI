import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
import { authApi } from '../api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await authApi.forgotPassword(email);
            setIsSubmitted(true);
        } catch (err) {
            setError(err.message || 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md bg-card p-8 rounded-3xl shadow-2xl border border-border animate-in fade-in zoom-in duration-500">
                <Link to="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Login
                </Link>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Forgot Password?</h1>
                    <p className="text-muted-foreground">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {isSubmitted ? (
                    <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Check your email</h3>
                        <p className="text-muted-foreground mb-6">
                            If an account exists for <strong>{email}</strong>, we have sent a password reset link.
                        </p>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-primary hover:underline font-medium"
                        >
                            Try another email
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center font-medium border border-destructive/20 animate-in shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-modern bg-background pl-10 w-full"
                                    placeholder="Enter your email"
                                    required
                                />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-3 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
