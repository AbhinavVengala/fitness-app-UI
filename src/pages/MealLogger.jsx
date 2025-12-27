import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/Card';
import BarcodeScanner from '../components/BarcodeScanner';
import { Search, Plus, Trash2, Loader2, X, Apple, Flame, Scale, ScanBarcode } from 'lucide-react';
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
    const [inputMode, setInputMode] = useState('servings'); // 'servings' or 'grams'
    const [grams, setGrams] = useState(100);

    // Scanner state
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        loadFoods();
        loadCategories();
    }, [userId]);

    const loadCategories = async () => {
        try {
            const cats = await foodsApi.getCategories();
            const smartCats = ['breakfast', 'lunch', 'dinner', 'snack'];
            const apiCats = cats.filter(c => !smartCats.includes(c) && c !== 'snacks'); // Handle 'snacks' plural diff
            setCategories([...smartCats, ...apiCats]);
        } catch (error) {
            console.error('Failed to load categories:', error);
            setCategories(['breakfast', 'lunch', 'dinner', 'snack', 'indian', 'protein', 'grains', 'fruits', 'vegetables', 'dairy']);
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

    // Helper functions for food categorization
    const isBreakfastItem = (food) => {
        const name = food.name.toLowerCase();
        const cat = food.category.toLowerCase();
        return name.includes('oat') || name.includes('egg') || name.includes('toast') ||
            name.includes('bread') || name.includes('cereal') || name.includes('coffee') ||
            name.includes('tea') || name.includes('milk') || name.includes('dosa') ||
            name.includes('idli') || name.includes('upma') || name.includes('pongal') ||
            name.includes('paratha') || name.includes('poha') || name.includes('pancake') ||
            cat === 'dairy' || cat === 'fruits' || cat === 'beverages';
    };

    const isMainMealItem = (food) => {
        const name = food.name.toLowerCase();
        return name.includes('rice') || name.includes('roti') || name.includes('chapati') ||
            name.includes('naan') || name.includes('curry') || name.includes('dal') ||
            name.includes('paneer') || name.includes('chicken') || name.includes('fish') ||
            name.includes('biryani') || name.includes('pulao') || name.includes('sabzi') ||
            name.includes('khichdi') || name.includes('salad') || name.includes('soup') ||
            name.includes('pasta') || name.includes('burger') || name.includes('pizza');
    };

    const isSnackItem = (food) => {
        const name = food.name.toLowerCase();
        const cat = food.category.toLowerCase();
        return cat === 'snacks' || cat === 'nuts' || cat === 'beverages' || cat === 'fruits' ||
            name.includes('samosa') || name.includes('chaat') || name.includes('biscuit') ||
            name.includes('maggi') || name.includes('sandwich') || name.includes('burger') ||
            name.includes('fry') || name.includes('popcorn') || name.includes('chip');
    };

    const filteredFoods = foods.filter(food => {
        if (activeCategory === 'all') return true;

        if (activeCategory === 'breakfast') return isBreakfastItem(food);
        if (activeCategory === 'lunch' || activeCategory === 'dinner') return isMainMealItem(food);
        if (activeCategory === 'snack') return isSnackItem(food);

        return food.category === activeCategory;
    });

    const openAddModal = (food) => {
        setSelectedFood(food);
        setQuantity(1);

        // Determine default input mode and grams
        const base = getBaseWeight(food);
        setGrams(base);
        setInputMode('servings');

        setShowAddModal(true);
    };

    const getBaseWeight = (food) => {
        if (!food) return 100;
        const name = food.name.toLowerCase();

        if (name.includes('100g')) return 100;

        // Rice/Biryani/Pulao - approx 150g per cup/serving
        if (name.includes('rice') || name.includes('biryani') || name.includes('pulao') || name.includes('khichdi')) {
            if (name.includes('cup')) return 150;
            if (name.includes('plate')) return 350;
        }

        // Curries/Dals - approx 250g per cup (lighter curries might be 200, dense 300)
        if (name.includes('cup')) return 250;

        // Roti/Pieces - usually weight is not the primary measure, but approx
        if (name.includes('roti') || name.includes('chapati')) return 40;
        if (name.includes('naan')) return 80;
        if (name.includes('paratha')) return 80;
        if (name.includes('idli')) return 40;
        if (name.includes('dosa')) return 80;

        return 100; // Default fallback
    };

    // Sync grams when quantity changes in serving mode
    // Sync quantity when grams changes in grams mode
    const handleGramsChange = (val) => {
        const g = parseFloat(val) || 0;
        setGrams(g);
        if (selectedFood) {
            const base = getBaseWeight(selectedFood);
            setQuantity(g / base);
        }
    };

    // We already have setQuantity, but we need to update Grams visual if we switch back
    const handleQuantityChange = (val) => {
        const q = parseFloat(val) || 0;
        setQuantity(q);
        if (selectedFood) {
            const base = getBaseWeight(selectedFood);
            setGrams((q * base).toFixed(0));
        }
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
                name: `${selectedFood.name} (${inputMode === 'grams' ? `${grams}g` : `×${quantity.toFixed(1)}`})`,
                calories: parseFloat(macros.calories),
                protein: parseFloat(macros.protein),
                carbs: parseFloat(macros.carbs),
                fats: parseFloat(macros.fats),
                quantity: quantity,
                servingUnit: inputMode === 'grams' ? 'g' : 'serving',
                servingValue: inputMode === 'grams' ? grams : quantity,
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
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap border ${activeCategory === category
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
        >
            {label}
        </button>
    );

    const totals = getTotalMacros();

    return (
        <>
            <div className="space-y-6 pb-10 animate-in">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Meal Logger</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track your nutrition with adjustable portions</p>
                </div>

                {/* Stats Card */}
                {/* Stats Card */}
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm font-medium">Calories Consumed Today</p>
                            <p className="text-4xl font-bold mt-1">{getTotalCalories().toFixed(0)} kcal</p>
                            <div className="flex gap-4 mt-3 text-sm font-medium text-white/90">
                                <span className="bg-white/20 px-2 py-1 rounded-md">P: {totals.protein.toFixed(0)}g</span>
                                <span className="bg-white/20 px-2 py-1 rounded-md">C: {totals.carbs.toFixed(0)}g</span>
                                <span className="bg-white/20 px-2 py-1 rounded-md">F: {totals.fats.toFixed(0)}g</span>
                            </div>
                        </div>
                        <div className="bg-white/20 p-4 rounded-2xl">
                            <Apple className="w-10 h-10 text-white" />
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Search & Foods */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Search & Filters */}
                        {/* Search & Filters */}
                        <Card>
                            <h2 className="text-xl font-bold text-foreground mb-4">Add Food</h2>

                            <div className="space-y-4">
                                {/* Search */}
                                {/* Search & Scanner Row */}
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Search foods..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="input-modern bg-background !pl-14 w-full"
                                        />
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        {isSearching && (
                                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setShowScanner(true)}
                                        className="p-3 bg-primary text-primary-foreground rounded-xl shadow-sm hover:bg-primary/90 transition-all flex items-center justify-center min-w-[3rem]"
                                        title="Scan Barcode"
                                    >
                                        <ScanBarcode className="w-5 h-5" />
                                    </button>
                                </div>



                                {/* Category Tabs */}
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
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
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-foreground">
                                    Available Foods
                                </h2>
                                <span className="text-sm text-muted-foreground">{filteredFoods.length} items</span>
                            </div>

                            {isLoadingFoods ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : filteredFoods.length === 0 ? (
                                <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                                    <Search className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No foods found matching your criteria</p>
                                </div>
                            ) : (
                                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {filteredFoods.map(food => (
                                        <MealCard
                                            key={food.id}
                                            food={food}
                                            onAdd={() => openAddModal(food)}
                                        />
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>


                    {/* Right Column: Today's Log */}
                    <div className="space-y-6">
                        <Card className="lg:sticky lg:top-6 h-fit">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-foreground">Today's Log</h2>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="animate-spin text-primary" size={24} />
                                </div>
                            ) : foodLog.length > 0 ? (
                                <ul className="divide-y divide-border">
                                    {foodLog.map(food => (
                                        <li key={food.id} className="flex justify-between items-center py-3 group">
                                            <div>
                                                <p className="font-medium text-foreground">{food.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="capitalize">{food.meal}</span> • P: {food.protein}g C: {food.carbs}g F: {food.fats}g
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold text-green-600 dark:text-green-400">{food.calories} kcal</span>
                                                <button
                                                    onClick={() => handleRemoveFood(food.id)}
                                                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Apple className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">No foods logged today</p>
                                    <p className="text-sm text-muted-foreground/70">Click + on a food above to track your intake</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>


            </div>

            {/* Add Food Modal with Quantity */}
            {
                showAddModal && selectedFood && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in">
                        <div className="modal-surface rounded-3xl p-5 w-full max-w-md shadow-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <section>
                                    <h2 className="text-xl font-bold text-foreground">
                                        Add {selectedFood.name}
                                    </h2>
                                </section>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Quantity Selector */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-foreground">
                                            Quantity
                                        </label>
                                        <div className="flex bg-muted rounded-lg p-1">
                                            <button
                                                onClick={() => {
                                                    setInputMode('servings');
                                                    handleQuantityChange(1);
                                                }}
                                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${inputMode === 'servings' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                                            >
                                                Servings
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setInputMode('grams');
                                                    if (selectedFood) {
                                                        const base = getBaseWeight(selectedFood);
                                                        handleGramsChange(base);
                                                    }
                                                }}
                                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${inputMode === 'grams' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                                            >
                                                Grams
                                            </button>
                                        </div>
                                    </div>

                                    {inputMode === 'servings' ? (
                                        <>
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleQuantityChange(Math.max(0.25, quantity - 0.25))}
                                                    className="w-12 h-12 rounded-xl bg-muted text-foreground font-bold text-xl hover:bg-muted/80 transition-colors flex items-center justify-center"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    min="0.25"
                                                    step="0.25"
                                                    value={quantity}
                                                    onChange={(e) => handleQuantityChange(e.target.value)}
                                                    className="w-20 h-12 rounded-xl bg-background border border-border text-foreground text-center text-2xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none p-0"
                                                />
                                                <button
                                                    onClick={() => handleQuantityChange(quantity + 0.25)}
                                                    className="w-12 h-12 rounded-xl bg-muted text-foreground font-bold text-xl hover:bg-muted/80 transition-colors flex items-center justify-center"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="text-center text-xs text-muted-foreground mt-1">
                                                {quantity === 1 ? '1 serving' : `${quantity.toFixed(2)} servings`}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleGramsChange(Math.max(0, grams - 10))}
                                                    className="w-12 h-12 rounded-xl bg-muted text-foreground font-bold text-xl hover:bg-muted/80 transition-colors flex items-center justify-center"
                                                >
                                                    −
                                                </button>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="10"
                                                        value={grams}
                                                        onChange={(e) => handleGramsChange(e.target.value)}
                                                        className="w-24 h-12 rounded-xl bg-background border border-border text-foreground text-center text-2xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none p-0"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">g</span>
                                                </div>
                                                <button
                                                    onClick={() => handleGramsChange(grams + 10)}
                                                    className="w-12 h-12 rounded-xl bg-muted text-foreground font-bold text-xl hover:bg-muted/80 transition-colors flex items-center justify-center"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="text-center text-xs text-muted-foreground mt-1">
                                                Based on approx {getBaseWeight(selectedFood)}g per serving
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Meal Type */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Meal
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setMealType(type)}
                                                className={`py-2 rounded-lg text-sm font-medium transition-all border ${mealType === type
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                                                    }`}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Calculated Macros Preview */}
                                <div className="p-3 rounded-xl bg-muted/50 border border-border">
                                    <p className="text-muted-foreground text-xs text-center mb-2">Nutrition for {quantity} serving(s)</p>
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        <div>
                                            <div className="text-base font-bold text-foreground">{calculateMacros().calories}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase">kcal</div>
                                        </div>
                                        <div>
                                            <div className="text-base font-bold text-foreground">{calculateMacros().protein}g</div>
                                            <div className="text-[10px] text-muted-foreground uppercase">Prot</div>
                                        </div>
                                        <div>
                                            <div className="text-base font-bold text-foreground">{calculateMacros().carbs}g</div>
                                            <div className="text-[10px] text-muted-foreground uppercase">Carb</div>
                                        </div>
                                        <div>
                                            <div className="text-base font-bold text-foreground">{calculateMacros().fats}g</div>
                                            <div className="text-[10px] text-muted-foreground uppercase">Fat</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-5">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 px-4 rounded-xl font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddFood}
                                    className="flex-1 py-3 px-4 rounded-xl font-semibold btn-primary flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Food
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Barcode Scanner Modal */}
            {
                showScanner && (
                    <BarcodeScanner
                        onScan={async (code) => {
                            setShowScanner(false);
                            try {
                                // 1. Search by barcode
                                const food = await foodsApi.getByBarcode(code);
                                // 2. Open add modal
                                openAddModal(food);
                            } catch (err) {
                                console.error(err);
                                alert("Scanner Error: Product not found in database or API error.");
                            }
                        }}
                        onClose={() => setShowScanner(false)}
                    />
                )
            }
        </>
    );
};

const MealCard = ({ food, onAdd }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="rounded-xl bg-card border border-border hover:border-primary/50 transition-all group shadow-sm hover:shadow-md overflow-hidden flex flex-col h-full">
            <div className="relative h-40 w-full bg-muted">
                {!imageError ? (
                    <img
                        src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'}
                        onError={() => setImageError(true)}
                        alt={food.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 text-muted-foreground">
                        <Apple className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-xs font-medium">No Image</span>
                    </div>
                )}

                <div className="absolute top-2 left-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/10">
                        {food.category}
                    </span>
                </div>
                <button
                    onClick={onAdd}
                    className="absolute bottom-2 right-2 p-2 rounded-lg bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-1" title={food.name}>
                    {food.name}
                </h3>

                <div className="mt-auto pt-3 grid grid-cols-4 gap-2 text-center border-t border-border">
                    <div>
                        <div className="font-bold text-foreground text-sm">{food.calories}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">kcal</div>
                    </div>
                    <div>
                        <div className="font-bold text-foreground text-sm">{food.protein}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Pro</div>
                    </div>
                    <div>
                        <div className="font-bold text-foreground text-sm">{food.carbs}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Carb</div>
                    </div>
                    <div>
                        <div className="font-bold text-foreground text-sm">{food.fats}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Fat</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealLogger;