import React from 'react';
import { useCart } from '../context/CartContext';
import { useDispatch } from 'react-redux';
import { setPage } from '../store/slices/profileSlice';
import { Minus, Plus, Trash2, ChevronRight, ShoppingBag, ArrowLeft } from 'lucide-react';

const CartPage = () => {
    const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
    const dispatch = useDispatch();

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Your Cart is Empty</h2>
                <p className="text-muted-foreground mb-8 text-center max-w-xs">
                    Looks like you haven't added any healthy meals yet.
                </p>
                <button
                    onClick={() => dispatch(setPage('foodOrder'))}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25"
                >
                    Browse Food
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => dispatch(setPage('foodOrder'))}
                    className="p-2 rounded-xl hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Your Cart</h1>
                    <p className="text-muted-foreground text-sm">{cartItems.length} Items</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map(item => (
                        <div key={item.id} className="bg-card border border-border p-4 rounded-2xl flex gap-4 items-center shadow-sm">
                            <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                                <span className="text-2xl">🍽️</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-foreground truncate">{item.name}</h3>
                                <p className="text-xs text-muted-foreground truncate">{item.restaurantName || "Restaurant"}</p>
                                <p className="font-bold text-primary mt-1">₹{item.price}</p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-1">
                                    <button
                                        onClick={() => item.quantity > 1 ? updateQuantity(item.id, -1) : removeFromCart(item.id)}
                                        className="p-1.5 rounded-md hover:bg-background shadow-sm transition-all text-foreground"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="p-1.5 rounded-md hover:bg-background shadow-sm transition-all text-foreground"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-lg sticky top-24">
                        <h3 className="text-lg font-bold text-foreground mb-4">Bill Details</h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Item Total</span>
                                <span>₹{cartTotal}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Delivery Fee</span>
                                <span className="text-green-500 font-medium">FREE</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Taxes & Charges</span>
                                <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-border my-2"></div>
                            <div className="flex justify-between text-lg font-bold text-foreground">
                                <span>To Pay</span>
                                <span>₹{(cartTotal * 1.05).toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => dispatch(setPage('payment'))}
                            className="w-full py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
                        >
                            Proceed to Payment
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <p className="text-xs text-center text-muted-foreground mt-4">
                            Safe & Secure Payment via Razorpay
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
