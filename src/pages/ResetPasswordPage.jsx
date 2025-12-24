import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Loader2, CheckCircle } from 'lucide-react';
import { authApi } from '../api';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await authApi.resetPassword(token, password);
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/auth');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md bg-card p-8 rounded-3xl shadow-2xl border border-border animate-in fade-in zoom-in duration-500">
                {isSuccess ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Password Reset Successful!</h3>
                        <p className="text-muted-foreground mb-6">
                            Redirecting you to login...
                        </p>
                    </div>
                ) : (
                    <>
                        <Link to="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Login
                        </Link>

                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
                            <p className="text-muted-foreground">
                                Enter your new password below.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center font-medium border border-destructive/20 animate-in shake">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground ml-1 mb-1 block">New Password</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="input-modern bg-background pl-10 w-full"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground ml-1 mb-1 block">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="input-modern bg-background pl-10 w-full"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !!error}
                                className="btn-primary w-full py-3 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
