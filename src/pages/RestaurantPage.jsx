import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Star, Clock, MapPin, Search, Filter, Plus, Minus, Info, ChevronRight } from 'lucide-react';
import FoodDetailsModal from '../components/FoodDetailsModal';
import { setPage, selectSelectedRestaurantId, setSelectedRestaurantId } from '../store/slices/profileSlice';
import { useCart } from '../context/CartContext';
import { restaurantsApi } from '../api';

const RestaurantPage = () => {
    const dispatch = useDispatch();
    const restaurantId = useSelector(selectSelectedRestaurantId);
    const { addToCart, removeFromCart, updateQuantity, cartItems, cartTotal } = useCart();

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Recommended');
    const [selectedFoodItem, setSelectedFoodItem] = useState(null);

    const handleFoodItemClick = (item) => {
        setSelectedFoodItem(item);
    };

    useEffect(() => {
        if (!restaurantId) {
            dispatch(setPage('foodOrder'));
            return;
        }

        const fetchDetails = async () => {
            try {
                const allRestaurants = await restaurantsApi.getAll();
                const found = allRestaurants.find(r => r.id === restaurantId);
                if (found) {
                    setRestaurant(found);
                } else {
                    dispatch(setPage('foodOrder'));
                }
            } catch (error) {
                console.error("Failed to load restaurant", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [restaurantId, dispatch]);

    const getItemQuantity = (itemId) => {
        const item = cartItems.find(i => i.id === itemId);
        return item ? item.quantity : 0;
    };

    if (loading || !restaurant) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const filteredItems = restaurant.items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="min-h-screen bg-background pb-32 animate-in -mx-4 md:-mx-0">
                <div className="relative h-64 md:h-80 w-full overflow-hidden md:rounded-b-3xl">
                    <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="absolute top-4 left-4 z-10">
                        <button
                            onClick={() => dispatch(setPage('foodOrder'))}
                            className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                        <div className="max-w-4xl mx-auto w-full">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-bold mb-2">{restaurant.name}</h1>
                                    <p className="text-white/80 md:text-lg flex items-center gap-2">
                                        <span className="opacity-75">{restaurant.category}</span>
                                        <span className="w-1 h-1 bg-white rounded-full" />
                                        <MapPin className="w-4 h-4" /> {restaurant.distance}
                                    </p>
                                </div>
                                <div className="hidden md:flex flex-col items-end gap-1">
                                    <div className="bg-green-600 px-3 py-1 rounded-xl text-lg font-bold flex items-center gap-1 shadow-lg">
                                        {restaurant.rating} <Star className="w-4 h-4 fill-current" />
                                    </div>
                                    <span className="text-sm opacity-75">1k+ Ratings</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 md:px-0 mt-8">
                    <div className="flex items-center gap-6 p-4 rounded-2xl bg-card border border-border shadow-sm mb-8 overflow-x-auto">
                        <div className="flex items-center gap-2 min-w-max">
                            <Clock className="w-5 h-5 text-orange-500" />
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Time</p>
                                <p className="font-semibold">{restaurant.time}</p>
                            </div>
                        </div>
                        <div className="w-[1px] h-8 bg-border" />
                        <div className="flex items-center gap-2 min-w-max">
                            <Info className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Cuisines</p>
                                <p className="font-semibold">{restaurant.category}, Healthy</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sticky top-[72px] md:top-4 z-20 bg-background/95 backdrop-blur-md py-4 border-b border-border">
                        <h2 className="text-2xl font-bold">Menu</h2>

                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search in menu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-muted-foreground mb-4 flex items-center gap-2">
                                All Items ({filteredItems.length})
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredItems.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleFoodItemClick(item)}
                                        className="flex gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group cursor-pointer"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-3 h-3 rounded-full ${item.isVeg !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                                                {item.bestseller && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 uppercase tracking-wide">
                                                        Bestseller
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-lg text-foreground mb-1">{item.name}</h3>
                                            <p className="font-medium text-foreground mb-2">₹{item.price}</p>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {item.description || "A delicious healthy choice rich in nutrients."}
                                            </p>
                                            <p className="text-xs text-orange-600 mt-2 font-medium flex items-center gap-1">
                                                🔥 {item.calories} calories
                                            </p>
                                        </div>

                                        <div className="relative w-32 h-32 flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                                <div className="w-full h-full bg-secondary rounded-xl flex items-center justify-center">
                                                    <span className="text-3xl">🍲</span>
                                                </div>
                                            )}

                                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 shadow-lg">
                                                {getItemQuantity(item.id) > 0 ? (
                                                    <div className="flex items-center bg-white dark:bg-zinc-800 rounded-lg border border-green-200 dark:border-green-900 overflow-hidden h-9 shadow-sm">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                getItemQuantity(item.id) === 1 ? removeFromCart(item.id) : updateQuantity(item.id, -1);
                                                            }}
                                                            className="px-3 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors h-full flex items-center"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="font-bold text-green-700 dark:text-green-400 w-6 text-center text-sm">
                                                            {getItemQuantity(item.id)}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateQuantity(item.id, 1);
                                                            }}
                                                            className="px-3 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors h-full flex items-center"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            addToCart(item, restaurant);
                                                        }}
                                                        className="bg-white dark:bg-zinc-800 text-green-600 dark:text-green-400 font-bold px-6 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wide"
                                                    >
                                                        ADD
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {
                selectedFoodItem && (
                    <FoodDetailsModal
                        item={selectedFoodItem}
                        restaurant={restaurant}
                        onClose={() => setSelectedFoodItem(null)}
                    />
                )
            }

            {
                cartItems.length > 0 && (
                    <div className="fixed bottom-6 left-4 right-4 z-40 animate-in slide-in-from-bottom-5 fade-in duration-300">
                        <button
                            onClick={() => dispatch(setPage('cart'))}
                            className="w-full bg-slate-900/90 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between group border border-white/10 hover:bg-slate-900 transition-all dark:bg-white/10 dark:hover:bg-white/20"
                        >
                            <div className="flex flex-col items-start px-1">
                                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-0.5">{cartItems.length} ITEMS</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold">₹{cartTotal}</span>
                                    <span className="text-xs opacity-60 font-medium">plus taxes</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 font-bold px-4 py-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all text-sm">
                                View Cart <ChevronRight className="w-4 h-4" />
                            </div>
                        </button>
                    </div>
                )
            }
        </>
    );
};

export default RestaurantPage;
