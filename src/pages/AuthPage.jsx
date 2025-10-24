import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../components/Card';
import { Loader2 } from 'lucide-react';
import { login, setAuthError } from '../store/slices/authSlice';

const AuthPage = () => {
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector(state => state.auth);
    const [email, setEmail] = useState('user@example.com');
    const [password, setPassword] = useState('password123');

    const handleSubmit = (e) => { 
        e.preventDefault(); 
        dispatch(setAuthError(null));
        dispatch(login({ email, password }));
    }; 

    return (<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900"><Card className="w-full max-w-sm"><h1 className="text-2xl font-bold text-center mb-1">Fitness Tracker MVP</h1><p className="text-center text-sm text-gray-500 mb-6">Log in with: user@example.com / password123</p><form onSubmit={handleSubmit} className="space-y-4"><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded-md" required /><input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded-md" required /><button type="submit" disabled={isLoading} className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300">{isLoading ? <Loader2 className="animate-spin mx-auto"/> : 'Login'}</button>{error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}</form></Card></div>);
};

export default AuthPage;