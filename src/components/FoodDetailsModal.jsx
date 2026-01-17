import React from 'react';
import { X, Plus, Minus, Flame, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useDispatch } from 'react-redux';
import { setPage } from '../store/slices/profileSlice';

const FoodDetailsModal = ({ item, onClose, restaurant }) => {
    const dispatch = useDispatch();
    const { addToCart, removeFromCart, updateQuantity, cartItems, cartTotal } = useCart();

    if (!item) return null;

    const cartItem = cartItems.find(i => i.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    // Mock nutritional data if not present
    const macros = item.macros || {
        protein: Math.floor(Math.random() * 20 + 10) + 'g',
        carbs: Math.floor(Math.random() * 30 + 20) + 'g',
        fats: Math.floor(Math.random() * 10 + 5) + 'g',
        fiber: Math.floor(Math.random() * 5 + 2) + 'g'
    };

    const benefits = item.benefits || [
        "High Protein",
        "Low Glycemic Index",
        "Rich in Fiber"
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="modal-surface w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative h-56 w-full flex-shrink-0">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-4 left-6 right-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-4 h-4 rounded-full border-2 border-white ${item.isVeg !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm font-medium bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm">
                                {item.isVeg !== false ? 'Vegetarian' : 'Non-Vegetarian'}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold mb-1">{item.name}</h2>
                        <h3 className="text-xl font-semibold opacity-90">₹{item.price}</h3>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto bg-card flex-1 min-h-0">
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                        {item.description || "A nutritious and delicious choice prepared with fresh ingredients to support your fitness goals."}
                    </p>

                    <div className="grid grid-cols-4 gap-2 mb-6">
                        <div className="bg-orange-50 dark:bg-orange-500/10 p-2 rounded-xl border border-orange-100 dark:border-orange-500/20 text-center">
                            <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
                            <p className="text-[10px] text-orange-600/70 dark:text-orange-400/70 font-bold uppercase">Cals</p>
                            <p className="font-bold text-orange-700 dark:text-orange-100 text-sm">{item.calories}</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-500/10 p-2 rounded-xl border border-blue-100 dark:border-blue-500/20 text-center">
                            <div className="text-base mb-1">💪</div>
                            <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 font-bold uppercase">Protein</p>
                            <p className="font-bold text-blue-700 dark:text-blue-100 text-sm">{macros.protein}</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-500/10 p-2 rounded-xl border border-yellow-100 dark:border-yellow-500/20 text-center">
                            <div className="text-base mb-1">🌾</div>
                            <p className="text-[10px] text-yellow-600/70 dark:text-yellow-400/70 font-bold uppercase">Carbs</p>
                            <p className="font-bold text-yellow-700 dark:text-yellow-100 text-sm">{macros.carbs}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-500/10 p-2 rounded-xl border border-green-100 dark:border-green-500/20 text-center">
                            <div className="text-base mb-1">🥑</div>
                            <p className="text-[10px] text-green-600/70 dark:text-green-400/70 font-bold uppercase">Fats</p>
                            <p className="font-bold text-green-700 dark:text-green-100 text-sm">{macros.fats}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" /> Fitness Benefits
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {benefits.map((benefit, idx) => (
                                <span key={idx} className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                                    {benefit}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-border mt-auto bg-card">
                    {quantity > 0 ? (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 bg-secondary/50 rounded-xl p-2 px-4 shadow-sm w-full justify-between">
                                    <button
                                        onClick={() => quantity === 1 ? removeFromCart(item.id) : updateQuantity(item.id, -1)}
                                        className="p-2 hover:bg-background rounded-lg transition-colors text-primary"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <span className="font-bold text-xl">{quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="p-2 hover:bg-background rounded-lg transition-colors text-primary"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    onClose();
                                    dispatch(setPage('cart'));
                                }}
                                className="w-full bg-slate-900/90 backdrop-blur-xl text-white p-3 px-4 rounded-xl shadow-lg flex items-center justify-between group border border-white/10 hover:bg-slate-900 transition-all dark:bg-zinc-800 dark:hover:bg-zinc-700 mt-2"
                            >
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest leading-none mb-0.5">{cartItems.length} ITEMS</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold">₹{cartTotal}</span>
                                        <span className="text-[10px] opacity-60 font-medium">plus taxes</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all text-xs">
                                    View Cart <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => addToCart(item, restaurant)}
                            className="w-full py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all"
                        >
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FoodDetailsModal;
