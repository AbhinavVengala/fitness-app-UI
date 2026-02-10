import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Trash2, Edit2, Search, Apple, Dumbbell, ShoppingBag, Utensils, X, Check, Loader2, Star, Clock, MapPin } from 'lucide-react';
import { foodsApi, exercisesApi, ordersApi, restaurantsApi } from '../api';
import { selectUserId } from '../store/slices/profileSlice';

const AdminPage = () => {
    const userId = useSelector(selectUserId);
    const [activeTab, setActiveTab] = useState('foods');
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editItem, setEditItem] = useState(null);

    // Pagination State
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const PAGE_SIZE = 20;

    // Reset on tab change
    useEffect(() => {
        setPage(0);
        setCategories([]);
        setSelectedCategory('all');
        setSearchQuery('');
        setItems([]);
    }, [activeTab]);

    useEffect(() => {
        setPage(0);
    }, [selectedCategory, searchQuery]);

    useEffect(() => {
        loadData();
    }, [page, activeTab, selectedCategory, userId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            let data;
            if (activeTab === 'foods') {
                if (searchQuery.trim()) {
                    data = await foodsApi.search(searchQuery, userId, page, PAGE_SIZE);
                    setItems(data.content || []);
                    setTotalPages(data.totalPages || 0);
                } else if (selectedCategory === 'all') {
                    data = await foodsApi.getAll(userId, page, PAGE_SIZE);
                    setItems(data.content || []);
                    setTotalPages(data.totalPages || 0);
                } else {
                    data = await foodsApi.getByCategory(selectedCategory, userId, page, PAGE_SIZE);
                    setItems(data.content || []);
                    setTotalPages(data.totalPages || 0);
                }
            } else if (activeTab === 'exercises') {
                const api = exercisesApi;
                if (selectedCategory === 'all') {
                    data = await api.getAll(userId);
                } else {
                    data = await api.getByCategory(selectedCategory, userId);
                }
                if (searchQuery.trim()) {
                    data = await api.search(searchQuery, userId);
                }
                setItems(data);
                setTotalPages(0);
            } else if (activeTab === 'orders') {
                data = await ordersApi.getAll();
                let orders = data;
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    orders = orders.filter(o =>
                        (o.userId && o.userId.toLowerCase().includes(q)) ||
                        (o.status && o.status.toLowerCase().includes(q)) ||
                        (o.razorpayOrderId && o.razorpayOrderId.toLowerCase().includes(q))
                    );
                }
                if (selectedCategory !== 'all') {
                    orders = orders.filter(o => o.status === selectedCategory);
                }
                setItems(orders);
                setTotalPages(0);
            } else if (activeTab === 'restaurants') {
                data = await restaurantsApi.getAll();
                let rests = data;
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    rests = rests.filter(r =>
                        r.name.toLowerCase().includes(q) ||
                        (r.items && r.items.some(i => i.name.toLowerCase().includes(q)))
                    );
                }
                if (selectedCategory !== 'all') {
                    rests = rests.filter(r => r.category === selectedCategory);
                }
                setItems(rests);
                setTotalPages(0);
            }

            // Load categories
            if (activeTab === 'foods') {
                const cats = await foodsApi.getCategories();
                setCategories(cats);
            } else if (activeTab === 'exercises') {
                const cats = await exercisesApi.getCategories();
                setCategories(cats);
            } else if (activeTab === 'orders') {
                setCategories(['CREATED', 'PAID', 'FAILED']);
            } else if (activeTab === 'restaurants') {
                setCategories(['Healthy', 'Vegan', 'Protein', 'Keto', 'Juices']);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced Search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) {
                loadData();
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            if (activeTab === 'foods') await foodsApi.delete(id);
            else if (activeTab === 'exercises') await exercisesApi.delete(id);
            else if (activeTab === 'orders') await ordersApi.delete(id);
            else if (activeTab === 'restaurants') await restaurantsApi.delete(id);
            loadData();
        } catch (error) {
            alert('Failed to delete: ' + error.message);
        }
    };

    const handleSave = async (item) => {
        try {
            if (activeTab === 'foods') {
                if (editItem?.id) await foodsApi.update(editItem.id, item);
                else await foodsApi.create({ ...item, createdByUserId: userId });
            } else if (activeTab === 'exercises') {
                if (editItem?.id) await exercisesApi.update(editItem.id, item);
                else await exercisesApi.create({ ...item, createdByUserId: userId });
            } else if (activeTab === 'orders') {
                if (editItem?.id) await ordersApi.update(editItem.id, item);
                else await ordersApi.create(item);
            } else if (activeTab === 'restaurants') {
                if (editItem?.id) await restaurantsApi.update(editItem.id, item);
                else await restaurantsApi.create(item);
            }
            setShowAddModal(false);
            setEditItem(null);
            loadData();
        } catch (error) {
            alert('Failed to save: ' + error.message);
        }
    };

    // Client-side filtering wrapper (server handles most now or effectively handled in loadData for others)
    const filteredItems = items;

    const tabConfig = [
        { key: 'foods', label: 'Foods', icon: Apple },
        { key: 'exercises', label: 'Exercises', icon: Dumbbell },
        { key: 'restaurants', label: 'Restaurants', icon: Utensils },
        { key: 'orders', label: 'Orders', icon: ShoppingBag },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto pb-10 animate-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                    Manage Database
                </h1>
                <p className="text-muted-foreground mt-1">Manage foods, exercises, restaurants & orders</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {tabConfig.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all border ${activeTab === key
                            ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                            : 'bg-card text-muted-foreground border-border hover:bg-muted'
                            }`}
                    >
                        <Icon className="w-5 h-5" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-wrap gap-4 mb-6">
                {/* Search */}
                <div className="flex-1 min-w-64 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadData()}
                        placeholder={`Search ${activeTab}...`}
                        className="input-modern bg-background pl-12"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>

                {/* Category / Status filter */}
                <div className="relative">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-full px-4 py-3 pr-8 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none min-w-[150px]"
                    >
                        <option value="all">All {activeTab === 'orders' ? 'Statuses' : 'Categories'}</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}</option>
                        ))}
                    </select>
                </div>

                {/* Add button */}
                <button
                    onClick={() => { setEditItem(null); setShowAddModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold btn-primary whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" />
                    Add {tabConfig.find(t => t.key === activeTab)?.label.slice(0, -1)}
                </button>
            </div>

            {/* Items Grid */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className={`grid gap-4 ${activeTab === 'orders' || activeTab === 'restaurants' ? 'md:grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-md group flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 min-w-0">
                                    {activeTab === 'orders' ? (
                                        <>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-foreground truncate">
                                                    Order #{item.id?.slice(-8)}
                                                </h3>
                                                <StatusBadge status={item.status} />
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                User: {item.userId || 'N/A'}
                                            </p>
                                        </>
                                    ) : activeTab === 'restaurants' ? (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-foreground truncate text-lg">
                                                    {item.name}
                                                </h3>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold flex items-center gap-1 dark:bg-green-900/40 dark:text-green-400">
                                                    {item.rating} <Star className="w-3 h-3 fill-current" />
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                                                <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium uppercase tracking-wider text-[10px]">{item.category}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="font-semibold text-foreground truncate pr-2">
                                                {item.name}
                                            </h3>
                                            <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                                {item.category}
                                            </span>
                                            {item.createdByUserId && (
                                                <span className="ml-2 inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                    Custom
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                    <button
                                        onClick={() => { setEditItem(item); setShowAddModal(true); }}
                                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 rounded-lg hover:bg-destructive/10 text-destructive/70 hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Card Content based on Tab */}
                            <div className="mt-auto pt-2">
                                {activeTab === 'foods' && (
                                    <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                                        <div className="text-center">
                                            <div className="font-bold text-foreground text-sm">{item.calories}</div>
                                            <div className="text-[10px] uppercase">kcal</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold text-foreground text-sm">{item.protein}g</div>
                                            <div className="text-[10px] uppercase">Prot</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold text-foreground text-sm">{item.carbs}g</div>
                                            <div className="text-[10px] uppercase">Carb</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold text-foreground text-sm">{item.fats}g</div>
                                            <div className="text-[10px] uppercase">Fat</div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'exercises' && (
                                    <div className="text-sm text-muted-foreground pt-2 border-t border-border flex items-center gap-2">
                                        <span className="capitalize px-2 py-0.5 bg-muted rounded text-xs font-medium">{item.type}</span>
                                        {item.type === 'reps' && item.caloriesPerRep && <span>• {item.caloriesPerRep} cal/rep</span>}
                                        {item.type === 'duration' && item.met && <span>• MET: {item.met}</span>}
                                    </div>
                                )}

                                {activeTab === 'orders' && (
                                    <div className="pt-3 border-t border-border space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Amount</span>
                                            <span className="font-bold text-foreground">₹{item.totalAmount?.toFixed(2)}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground line-clamp-2">
                                            {item.items?.map(i => i.name).join(', ')}
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span>{item.razorpayOrderId}</span>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'restaurants' && (
                                    <div className="pt-3 border-t border-border mt-1">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                                            <MapPin className="w-3 h-3" /> {item.location || 'No location'}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-foreground">
                                                Menu Items ({item.items?.length || 0})
                                            </p>
                                            <div className="text-xs text-muted-foreground line-clamp-2">
                                                {item.items?.slice(0, 5).map(i => i.name).join(', ')}
                                                {(item.items?.length || 0) > 5 && '...'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredItems.length === 0 && !isLoading && (
                <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border mt-6">
                    <p>No {activeTab} found matching your criteria.</p>
                </div>
            )}

            {/* Pagination (Foods Only) */}
            {activeTab === 'foods' && totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                        Previous
                    </button>
                    <span className="flex items-center px-4 font-medium">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Modals */}
            {showAddModal && (
                activeTab === 'orders' ? (
                    <OrderModal
                        item={editItem}
                        onSave={handleSave}
                        onClose={() => { setShowAddModal(false); setEditItem(null); }}
                    />
                ) : activeTab === 'restaurants' ? (
                    <RestaurantModal
                        item={editItem}
                        categories={categories}
                        onSave={handleSave}
                        onClose={() => { setShowAddModal(false); setEditItem(null); }}
                    />
                ) : (
                    <ItemModal
                        type={activeTab}
                        item={editItem}
                        categories={categories}
                        onSave={handleSave}
                        onClose={() => { setShowAddModal(false); setEditItem(null); }}
                    />
                )
            )}
        </div>
    );
};

// --- Components ---

const StatusBadge = ({ status }) => {
    const colors = {
        CREATED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${colors[status] || 'bg-muted text-muted-foreground'}`}>
            {status || 'UNKNOWN'}
        </span>
    );
};

const ItemModal = ({ type, item, categories, onSave, onClose }) => {
    const isFood = type === 'foods';
    const [form, setForm] = useState(item || (isFood ? {
        name: '', calories: 0, protein: 0, carbs: 0, fats: 0, category: categories[0] || 'indian'
    } : {
        name: '', type: 'reps', caloriesPerRep: null, met: null, category: categories[0] || 'home'
    }));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(form);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-card rounded-3xl p-6 w-full max-w-md shadow-2xl border border-border">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-foreground">
                        {item ? 'Edit' : 'Add'} {isFood ? 'Food' : 'Exercise'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            className="input-modern bg-background w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="input-modern bg-background w-full"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    {isFood ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Calories</label>
                                    <input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: parseFloat(e.target.value) || 0 })} className="input-modern bg-background w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Protein (g)</label>
                                    <input type="number" step="0.1" value={form.protein} onChange={(e) => setForm({ ...form, protein: parseFloat(e.target.value) || 0 })} className="input-modern bg-background w-full" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Carbs (g)</label>
                                    <input type="number" step="0.1" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: parseFloat(e.target.value) || 0 })} className="input-modern bg-background w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Fats (g)</label>
                                    <input type="number" step="0.1" value={form.fats} onChange={(e) => setForm({ ...form, fats: parseFloat(e.target.value) || 0 })} className="input-modern bg-background w-full" />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-modern bg-background w-full">
                                    <option value="reps">Reps-based</option>
                                    <option value="duration">Duration-based</option>
                                </select>
                            </div>
                            {form.type === 'reps' ? (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Calories per Rep</label>
                                    <input type="number" step="0.1" value={form.caloriesPerRep || ''} onChange={(e) => setForm({ ...form, caloriesPerRep: parseFloat(e.target.value) || null, met: null })} className="input-modern bg-background w-full" />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">MET Value</label>
                                    <input type="number" step="0.1" value={form.met || ''} onChange={(e) => setForm({ ...form, met: parseFloat(e.target.value) || null, caloriesPerRep: null })} className="input-modern bg-background w-full" />
                                </div>
                            )}
                        </>
                    )}
                    <div className="flex gap-3 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-3 px-4 rounded-xl font-semibold btn-primary flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Save</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RestaurantModal = ({ item, categories, onSave, onClose }) => {
    const [form, setForm] = useState(item || {
        name: '', rating: 4.5, time: '30-40 min', distance: '3 km', location: '', category: categories[0] || 'Healthy', image: '', items: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', calories: 0, price: 0, description: '', isVeg: true });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(form);
        setIsSubmitting(false);
    };

    const addMenuItem = () => {
        if (!newItem.name.trim()) return;
        setForm({
            ...form,
            items: [...form.items, { ...newItem, id: `menu_${Date.now()}` }]
        });
        setNewItem({ name: '', calories: 0, price: 0, description: '', isVeg: true });
    };

    const removeMenuItem = (index) => {
        setForm({
            ...form,
            items: form.items.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-card rounded-3xl p-6 w-full max-w-2xl shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-foreground">
                        {item ? 'Edit' : 'Add'} Restaurant
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-modern bg-background w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-modern bg-background w-full">
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Rating</label>
                            <input type="number" step="0.1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} className="input-modern bg-background w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Time</label>
                            <input type="text" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="input-modern bg-background w-full" placeholder="e.g. 30-40 min" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Distance</label>
                            <input type="text" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} className="input-modern bg-background w-full" placeholder="e.g. 2.5 km" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                        <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-modern bg-background w-full" placeholder="Address" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Image URL</label>
                        <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-modern bg-background w-full" placeholder="https://..." />
                    </div>

                    {/* Menu Items */}
                    <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/20">
                        <h3 className="text-sm font-bold text-foreground mb-2">Menu Items</h3>

                        {form.items.length > 0 && (
                            <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                                {form.items.map((menuItem, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border text-sm shadow-sm">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${menuItem.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span className="font-semibold text-foreground">{menuItem.name}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {menuItem.calories} kcal • ₹{menuItem.price}
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => removeMenuItem(idx)} className="p-1.5 hover:bg-destructive/10 text-destructive/70 hover:text-destructive rounded transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Item Form */}
                        <div className="grid grid-cols-12 gap-2 items-end bg-card p-3 rounded-xl border border-border">
                            <div className="col-span-4">
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Item Name</label>
                                <input type="text" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="input-modern bg-muted/50 w-full h-8 text-sm px-2" placeholder="Name" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Price</label>
                                <input type="number" value={newItem.price || ''} onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })} className="input-modern bg-muted/50 w-full h-8 text-sm px-2" placeholder="₹" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Kcal</label>
                                <input type="number" value={newItem.calories || ''} onChange={(e) => setNewItem({ ...newItem, calories: parseFloat(e.target.value) || 0 })} className="input-modern bg-muted/50 w-full h-8 text-sm px-2" placeholder="Cal" />
                            </div>
                            <div className="col-span-3">
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                                <select value={newItem.isVeg} onChange={(e) => setNewItem({ ...newItem, isVeg: e.target.value === 'true' })} className="input-modern bg-muted/50 w-full h-8 text-sm px-2 py-0">
                                    <option value="true">Veg</option>
                                    <option value="false">Non-Veg</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <button type="button" onClick={addMenuItem} className="w-full h-8 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-3 px-4 rounded-xl font-semibold btn-primary flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Save</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const OrderModal = ({ item, onSave, onClose }) => {
    const [form, setForm] = useState(item || {
        userId: '', items: [], totalAmount: 0, status: 'CREATED', razorpayOrderId: '', razorpayPaymentId: '', createdAt: Date.now(),
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', calories: 0, price: 0, description: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(form);
        setIsSubmitting(false);
    };

    const addOrderItem = () => {
        if (!newItem.name.trim()) return;
        setForm({
            ...form,
            items: [...form.items, { ...newItem, id: `item_${Date.now()}` }],
            totalAmount: form.totalAmount + newItem.price,
        });
        setNewItem({ name: '', calories: 0, price: 0, description: '' });
    };

    const removeOrderItem = (index) => {
        const removed = form.items[index];
        setForm({
            ...form,
            items: form.items.filter((_, i) => i !== index),
            totalAmount: form.totalAmount - (removed?.price || 0),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-card rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-foreground">
                        {item ? 'Edit' : 'Add'} Order
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">User ID</label>
                            <input type="text" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} required className="input-modern bg-background w-full" placeholder="MongoDB User ID" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-modern bg-background w-full">
                                <option value="CREATED">Created</option>
                                <option value="PAID">Paid</option>
                                <option value="FAILED">Failed</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Total Amount (₹)</label>
                            <input type="number" step="0.01" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: parseFloat(e.target.value) || 0 })} className="input-modern bg-background w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Razorpay Order ID</label>
                            <input type="text" value={form.razorpayOrderId || ''} onChange={(e) => setForm({ ...form, razorpayOrderId: e.target.value })} className="input-modern bg-background w-full" placeholder="Optional" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Razorpay Payment ID</label>
                        <input type="text" value={form.razorpayPaymentId || ''} onChange={(e) => setForm({ ...form, razorpayPaymentId: e.target.value })} className="input-modern bg-background w-full" placeholder="Optional" />
                    </div>
                    <div className="border border-border rounded-xl p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Order Items ({form.items.length})</h3>
                        {form.items.length > 0 && (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {form.items.map((orderItem, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                                        <div>
                                            <span className="font-medium text-foreground">{orderItem.name}</span>
                                            <span className="text-muted-foreground ml-2">₹{orderItem.price}</span>
                                        </div>
                                        <button type="button" onClick={() => removeOrderItem(idx)} className="p-1 hover:bg-destructive/10 text-destructive/70 hover:text-destructive rounded transition-colors"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2 items-end">
                            <div className="flex-1"><input type="text" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Item name" className="input-modern bg-background w-full text-sm" /></div>
                            <div className="w-20"><input type="number" value={newItem.price || ''} onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })} placeholder="₹" className="input-modern bg-background w-full text-sm" /></div>
                            <button type="button" onClick={addOrderItem} className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex-shrink-0"><Plus className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-3 px-4 rounded-xl font-semibold btn-primary flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Save</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminPage;
