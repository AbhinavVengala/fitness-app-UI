import React, { useState } from 'react';
import FoodDetailsModal from '../components/FoodDetailsModal';
import { Search, Star, Clock, MapPin, Plus, Minus, ShoppingBag, Flame, Filter, ChevronRight } from 'lucide-react';

import { restaurantsApi } from '../api';
import { useCart } from '../context/CartContext';
import { useDispatch } from 'react-redux';
import { setPage, setSelectedRestaurantId } from '../store/slices/profileSlice';

const FoodOrderPage = () => {
    const dispatch = useDispatch();
    const { addToCart, removeFromCart, updateQuantity, cartItems, cartTotal } = useCart();
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    const getItemQuantity = (itemId) => {
        const item = cartItems.find(i => i.id === itemId);
        return item ? item.quantity : 0;
    };

    const handleRestaurantClick = (restaurantId) => {
        dispatch(setSelectedRestaurantId(restaurantId));
        dispatch(setPage('restaurant'));
    };

    const categories = [
        { id: 'All', label: 'All', icon: '🍽️' },
        { id: 'Healthy', label: 'Healthy', icon: '🥗' },
        { id: 'Vegan', label: 'Vegan', icon: '🌱' },
        { id: 'Protein', label: 'High Protein', icon: '💪' },
        { id: 'Keto', label: 'Keto', icon: '🥑' },
        { id: 'Juices', label: 'Juices', icon: '🥤' },
    ];

    React.useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const data = await restaurantsApi.getAll();
                setRestaurants(data);
            } catch (error) {
                console.error("Failed to fetch restaurants", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    const [showFilters, setShowFilters] = useState(false);
    const [selectedFoodItem, setSelectedFoodItem] = useState(null);
    const [selectedRestaurantForModal, setSelectedRestaurantForModal] = useState(null);

    const handleFoodItemClick = (item, restaurant) => {
        setSelectedFoodItem(item);
        setSelectedRestaurantForModal(restaurant);
    };

    const [filters, setFilters] = useState({
        minRating: 0,
        vegOnly: false,
        priceRange: 'all' // all, budget (< $15), premium (> $15)
    });

    const filteredRestaurants = restaurants.filter(r => {
        if (activeCategory !== 'All' && r.category !== activeCategory) return false;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = r.name.toLowerCase().includes(query);
            const matchesItems = r.items.some(item => item.name.toLowerCase().includes(query));
            if (!matchesName && !matchesItems) return false;
        }

        if (filters.minRating > 0 && r.rating < filters.minRating) return false;
        if (filters.vegOnly && r.category !== 'Vegan' && r.category !== 'Healthy') return false; // Simple logic for demo

        if (filters.priceRange !== 'all') {
            const hasBudget = r.items.some(i => i.price < 200);   // Budget < ₹200
            const hasPremium = r.items.some(i => i.price >= 200); // Premium >= ₹200
            if (filters.priceRange === 'budget' && !hasBudget) return false;
            if (filters.priceRange === 'premium' && !hasPremium) return false;
        }

        return true;
    });

    return (
        <>
            <div className="min-h-screen pb-40 animate-in">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-red-600 mb-8 p-8 md:p-12 text-white shadow-lg">
                    <div className="relative z-10 max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                            Craving Healthy? <br />We got you covered.
                        </h1>
                        <p className="text-orange-50 text-lg mb-8 font-medium">
                            Discover top-rated healthy restaurants tailored for your fitness goals.
                        </p>
                        <div className="relative max-w-md">
                            <input
                                type="text"
                                placeholder="Search for restaurants, items, or diets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-orange-500/30 outline-none font-medium shadow-xl"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute right-20 bottom-0 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl" />
                </div>

                <div className="mb-10">
                    <h2 className="text-xl font-bold text-foreground mb-4 px-1">What's on your mind?</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className="flex flex-col items-center gap-3 min-w-[100px] snap-start group"
                            >
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-sm transition-all duration-300 ${activeCategory === cat.id
                                    ? 'bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-500 scale-110 shadow-orange-500/20'
                                    : 'bg-card border border-border group-hover:scale-105 group-hover:shadow-md'
                                    }`}>
                                    {cat.icon}
                                </div>
                                <span className={`text-sm font-medium transition-colors ${activeCategory === cat.id ? 'text-orange-600' : 'text-muted-foreground group-hover:text-foreground'
                                    }`}>
                                    {cat.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="sticky top-[72px] z-30 bg-background/95 backdrop-blur-md py-3 mb-6 border-b border-border/50 -mx-4 px-4 md:mx-0 md:px-0 md:rounded-xl md:border md:top-4 transition-all">
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                        {(filters.minRating > 0 || filters.vegOnly || filters.priceRange !== 'all') && (
                            <button
                                onClick={() => setFilters({ minRating: 0, vegOnly: false, priceRange: 'all' })}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-bold whitespace-nowrap hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:border-red-900"
                            >
                                <Filter className="w-3 h-3" /> Clear
                            </button>
                        )}

                        {[
                            { id: 'veg', label: '🌱 Pure Veg', active: filters.vegOnly, onClick: () => setFilters(p => ({ ...p, vegOnly: !p.vegOnly })) },
                            { id: 'rating', label: '⭐ 4.0+', active: filters.minRating === 4, onClick: () => setFilters(p => ({ ...p, minRating: p.minRating === 4 ? 0 : 4 })) },
                            { id: 'budget', label: '📉 Budget', active: filters.priceRange === 'budget', onClick: () => setFilters(p => ({ ...p, priceRange: p.priceRange === 'budget' ? 'all' : 'budget' })) },
                            { id: 'premium', label: '💎 Premium', active: filters.priceRange === 'premium', onClick: () => setFilters(p => ({ ...p, priceRange: p.priceRange === 'premium' ? 'all' : 'premium' })) },
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={f.onClick}
                                className={`px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${f.active
                                    ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
                                    : 'bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-foreground">Top Healthy Picks For You</h2>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-80 bg-muted/40 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                            {filteredRestaurants.length > 0 ? (
                                filteredRestaurants.map(restaurant => (
                                    <div
                                        key={restaurant.id}
                                        onClick={() => handleRestaurantClick(restaurant.id)}
                                        className="group flex flex-col gap-4 cursor-pointer"
                                    >
                                        <div
                                            className="relative h-60 w-full rounded-3xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-300"
                                        >
                                            <img
                                                src={restaurant.image}
                                                alt={restaurant.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold shadow-sm text-gray-900">
                                                <Clock className="w-3 h-3" /> {restaurant.time}
                                            </div>

                                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                                <div className="text-white">
                                                    <h3 className="text-xl font-bold leading-none mb-1">{restaurant.name}</h3>
                                                    <p className="text-white/80 text-sm font-medium">{restaurant.category}</p>
                                                </div>
                                                <div className="bg-green-600 text-white px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1 shadow-lg">
                                                    {restaurant.rating} <Star className="w-3 h-3 fill-current" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Recommended</p>
                                                <div className="h-[1px] flex-1 bg-border/50 ml-3" />
                                            </div>
                                            <div className="space-y-3">
                                                {restaurant.items.slice(0, 3).map(item => (
                                                    <div
                                                        key={item.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFoodItemClick(item, restaurant);
                                                        }}
                                                        className="flex justify-between items-center group/item p-2 rounded-xl hover:bg-muted/50 transition-colors -mx-2 cursor-pointer"
                                                    >
                                                        <div className="flex-1 min-w-0 pr-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${item.isVeg !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                                                                <p className="font-medium text-foreground truncate">{item.name}</p>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-0.5">₹{item.price}</p>
                                                        </div>

                                                        {getItemQuantity(item.id) > 0 ? (
                                                            <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-lg px-2 py-1 dark:bg-orange-900/20 dark:border-orange-800">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        getItemQuantity(item.id) === 1 ? removeFromCart(item.id) : updateQuantity(item.id, -1);
                                                                    }}
                                                                    className="text-orange-600 hover:text-orange-700"
                                                                >
                                                                    <Minus className="w-3 h-3" />
                                                                </button>
                                                                <span className="text-sm font-bold text-orange-700 dark:text-orange-400 min-w-[12px] text-center">
                                                                    {getItemQuantity(item.id)}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateQuantity(item.id, 1);
                                                                    }}
                                                                    className="text-orange-600 hover:text-orange-700"
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
                                                                className="text-sm font-bold text-orange-600 bg-orange-50 px-4 py-1.5 rounded-lg border border-orange-100 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-sm dark:bg-orange-950 dark:border-orange-900"
                                                            >
                                                                ADD
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-60">
                                    <ShoppingBag className="w-20 h-20 text-muted-foreground mb-4" />
                                    <h3 className="text-2xl font-bold">No restaurants found</h3>
                                    <p>Try changing your filters or search term.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
            {
                cartItems.length > 0 && (
                    <div className="fixed bottom-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[500px] z-50">
                        <button
                            onClick={() => dispatch(setPage('cart'))}
                            className="w-full bg-slate-900/90 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between group border border-white/10 hover:bg-slate-900 transition-all dark:bg-white/10 dark:hover:bg-white/20"
                        >
                            <div className="flex flex-col items-start px-2">
                                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-0.5">{cartItems.length} ITEMS</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold">₹{cartTotal}</span>
                                    <span className="text-xs opacity-60 font-medium">plus taxes</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 font-bold px-4 py-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all">
                                View Cart <ChevronRight className="w-4 h-4" />
                            </div>
                        </button>
                    </div>
                )
            }
            {
                selectedFoodItem && (
                    <FoodDetailsModal
                        item={selectedFoodItem}
                        restaurant={selectedRestaurantForModal}
                        onClose={() => setSelectedFoodItem(null)}
                    />
                )
            }
        </>
    );
};

export default FoodOrderPage;
