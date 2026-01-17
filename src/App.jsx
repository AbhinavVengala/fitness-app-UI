import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { CartProvider } from './context/CartContext';

export default function App() {
    return (
        <BrowserRouter>
            <CartProvider>
                <Routes>
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="*" element={<MainLayout />} />
                </Routes>
            </CartProvider>
        </BrowserRouter>
    );
}
