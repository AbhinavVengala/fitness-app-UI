import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useDispatch } from 'react-redux';
import { setPage } from '../store/slices/profileSlice';
import { apiFetch } from '../api';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';

const PaymentPage = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const dispatch = useDispatch();
    const [processing, setProcessing] = useState(false);

    const totalAmount = (cartTotal * 1.05).toFixed(2); // Including 5% tax

    const handlePayment = async () => {
        setProcessing(true);
        try {
            const orderData = {
                items: cartItems,
                totalAmount: parseFloat(totalAmount)
            };

            const orderRes = await apiFetch('/payment/create-order', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });

            if (!orderRes) throw new Error("Order creation failed");

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                amount: orderRes.totalAmount * 100,
                currency: "INR",
                name: "Fitness Tracker Foods",
                description: "Healthy Food Order",
                order_id: orderRes.razorpayOrderId,
                handler: async function (response) {
                    await apiFetch('/payment/verify', {
                        method: 'POST',
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });

                    alert("Order Placed Successfully!");
                    clearCart();
                    dispatch(setPage('dashboard'));
                },
                prefill: {
                    name: "Abhi User",
                    email: "abhi@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#0f172a"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Payment failed", error);
            alert("Payment initialization failed. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto pb-20 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => dispatch(setPage('cart'))}
                    className="p-2 rounded-xl hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <h1 className="text-2xl font-bold text-foreground">Payment</h1>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-lg mb-6">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <CreditCard className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Total Payable</h2>
                    <p className="text-4xl font-bold text-primary mt-1">₹{totalAmount}</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-secondary/30 p-4 rounded-xl flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-foreground text-sm">Safe & Secure</h4>
                            <p className="text-xs text-muted-foreground">Your transaction is encrypted and secured.</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full mt-8 py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {processing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                        </>
                    ) : "Pay Now"}
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;
