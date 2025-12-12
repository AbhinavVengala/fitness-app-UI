import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/Card';
import { Search, Plus, Trash2, Loader2, X, Apple, Flame, Scale } from 'lucide-react';
import { foodsApi } from '../api';
import { addFoodAsync, removeFoodAsync } from '../store/slices/dataSlice';
import { selectActiveProfile, selectUserId } from '../store/slices/profileSlice';

const MealLogger = () => {
    const dispatch = useDispatch();
    const { foodLog, isLoading } = useSelector(state => state.data);
    const activeProfile = useSelector(selectActiveProfile);
    const userId = useSelector(selectUserId);

    const [searchTerm, setSearchTerm] = useState('');
    const [mealType, setMealType] = useState('snack');
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [isLoadingFoods, setIsLoadingFoods] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    // Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Load foods and categories on mount
    useEffect(() => {
        loadFoods();
        loadCategories();
    }, [userId]);

    const loadCategories = async () => {
        try {
            const cats = await foodsApi.getCategories();
            setCategories(cats);
        } catch (error) {
            console.error('Failed to load categories:', error);
            setCategories(['indian', 'protein', 'grains', 'fruits', 'vegetables', 'dairy']);
        }
    };

    const loadFoods = async () => {
        setIsLoadingFoods(true);
        try {
            const data = await foodsApi.getAll(userId);
            setFoods(data);
        } catch (error) {
            console.error('Failed to load foods:', error);
        } finally {
            setIsLoadingFoods(false);
        }
    };

    // Debounced search
    useEffect(() => {
        if (!searchTerm.trim()) {
            loadFoods();
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await foodsApi.search(searchTerm, userId);
                setFoods(results);
            } catch (error) {
                console.error('Food search error:', error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, userId]);

    const filteredFoods = foods.filter(food =>
        activeCategory === 'all' || food.category === activeCategory
    );

    const openAddModal = (food) => {
        setSelectedFood(food);
        setQuantity(1);
        setShowAddModal(true);
    };

    const calculateMacros = () => {
        if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
        return {
            calories: (selectedFood.calories * quantity).toFixed(0),
            protein: (selectedFood.protein * quantity).toFixed(1),
            carbs: (selectedFood.carbs * quantity).toFixed(1),
            fats: (selectedFood.fats * quantity).toFixed(1),
        };
    };

    const handleAddFood = () => {
        if (!activeProfile || !selectedFood) return;

        const macros = calculateMacros();
        dispatch(addFoodAsync({
            profileId: activeProfile.id,
            food: {
                foodId: selectedFood.id,
                name: `${selectedFood.name}${quantity !== 1 ? ` (×${quantity})` : ''}`,
                calories: parseFloat(macros.calories),
                protein: parseFloat(macros.protein),
                carbs: parseFloat(macros.carbs),
                fats: parseFloat(macros.fats),
                quantity: quantity,
                meal: mealType,
            }
        }));

        setShowAddModal(false);
        setSelectedFood(null);
        setQuantity(1);
    };

    const handleRemoveFood = (foodId) => {
        if (!activeProfile) return;
        dispatch(removeFoodAsync({
            profileId: activeProfile.id,
            foodId,
        }));
    };

    const getTotalCalories = () => {
        return foodLog.reduce((total, f) => total + (f.calories || 0), 0);
    };

    const getTotalMacros = () => {
        return foodLog.reduce((acc, f) => ({
            protein: acc.protein + (f.protein || 0),
            carbs: acc.carbs + (f.carbs || 0),
            fats: acc.fats + (f.fats || 0),
        }), { protein: 0, carbs: 0, fats: 0 });
    };

    const CategoryTab = ({ category, label }) => (
        <button
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeCategory === category
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
        >
            {label}
        </button>
    );

    const totals = getTotalMacros();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Meal Logger</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Track your nutrition with adjustable portions</p>
            </div>

            {/* Stats Card */}
            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/80 text-sm">Calories Consumed Today</p>
                        <p className="text-4xl font-bold">{getTotalCalories().toFixed(0)} kcal</p>
                        <div className="flex gap-4 mt-2 text-sm text-white/80">
                            <span>P: {totals.protein.toFixed(0)}g</span>
                            <span>C: {totals.carbs.toFixed(0)}g</span>
                            <span>F: {totals.fats.toFixed(0)}g</span>
                        </div>
                    </div>
                    <Apple className="w-16 h-16 text-white/30" />
                </div>
            </Card>

            {/* Search & Filters */}
            <Card>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Add Food</h2>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search foods..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 pl-12 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        {isSearching && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-green-500" />
                        )}
                    </div>

                    {/* Meal Type Selector */}
                    <div className="flex justify-center gap-2 flex-wrap">
                        {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                            <button
                                key={type}
                                onClick={() => setMealType(type)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${mealType === type
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <CategoryTab category="all" label="All" />
                        {categories.map(cat => (
                            <CategoryTab
                                key={cat}
                                category={cat}
                                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                            />
                        ))}
                    </div>
                </div>
            </Card>

            {/* Food Grid */}
            <Card>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    Available Foods
                </h2>

                {isLoadingFoods ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                    </div>
                ) : filteredFoods.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No foods found</p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredFoods.map(food => (
                            <div
                                key={food.id}
                                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-green-500 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-800 dark:text-white">
                                            {food.name}
                                        </h3>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                                            {food.category}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => openAddModal(food)}
                                        className="p-2 rounded-lg bg-green-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-600"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 gap-1 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                    <div className="text-center">
                                        <div className="font-bold text-slate-700 dark:text-slate-200">{food.calories}</div>
                                        <div>kcal</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-slate-700 dark:text-slate-200">{food.protein}g</div>
                                        <div>Protein</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-slate-700 dark:text-slate-200">{food.carbs}g</div>
                                        <div>Carbs</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-slate-700 dark:text-slate-200">{food.fats}g</div>
                                        <div>Fat</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Today's Log */}
            <Card>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Today's Log</h2>
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin text-green-500" size={24} />
                    </div>
                ) : foodLog.length > 0 ? (
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {foodLog.map(food => (
                            <li key={food.id} className="flex justify-between items-center py-3">
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">{food.name}</p>
                                    <p className="text-sm text-slate-500">
                                        {food.meal} • P: {food.protein}g C: {food.carbs}g F: {food.fats}g
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-green-600 font-semibold">{food.calories} kcal</span>
                                    <button
                                        onClick={() => handleRemoveFood(food.id)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8">
                        <Apple className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="text-slate-500">No foods logged today</p>
                        <p className="text-sm text-slate-400">Click + on a food to add it</p>
                    </div>
                )}
            </Card>

            {/* Add Food Modal with Quantity */}
            {showAddModal && selectedFood && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                Add {selectedFood.name}
                            </h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Quantity Selector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Servings / Quantity
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(0.25, quantity - 0.25))}
                                        className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xl hover:bg-slate-200 dark:hover:bg-slate-600"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        min="0.25"
                                        step="0.25"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white text-center text-2xl font-bold"
                                    />
                                    <button
                                        onClick={() => setQuantity(quantity + 0.25)}
                                        className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xl hover:bg-slate-200 dark:hover:bg-slate-600"
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="text-center text-sm text-slate-500 mt-1">
                                    {quantity === 1 ? '1 serving' : `${quantity} servings`}
                                </p>
                            </div>

                            {/* Meal Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Meal
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setMealType(type)}
                                            className={`py-2 rounded-lg text-sm font-medium transition-all ${mealType === type
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                }`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Calculated Macros Preview */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                <p className="text-white/80 text-sm text-center mb-2">Nutrition for {quantity} serving(s)</p>
                                <div className="grid grid-cols-4 gap-2 text-center">
                                    <div>
                                        <div className="text-2xl font-bold">{calculateMacros().calories}</div>
                                        <div className="text-xs text-white/80">kcal</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{calculateMacros().protein}g</div>
                                        <div className="text-xs text-white/80">Protein</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{calculateMacros().carbs}g</div>
                                        <div className="text-xs text-white/80">Carbs</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{calculateMacros().fats}g</div>
                                        <div className="text-xs text-white/80">Fat</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddFood}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Food
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealLogger;