import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Trash2, Edit2, Search, Apple, Dumbbell, X, Check, Loader2 } from 'lucide-react';
import { foodsApi, exercisesApi } from '../api';
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

    // Fetch data
    useEffect(() => {
        loadData();
    }, [activeTab, selectedCategory, userId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const api = activeTab === 'foods' ? foodsApi : exercisesApi;

            let data;
            if (selectedCategory === 'all') {
                data = await api.getAll(userId);
            } else {
                data = await api.getByCategory(selectedCategory, userId);
            }
            setItems(data);

            // Load categories
            const cats = await api.getCategories();
            setCategories(cats);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadData();
            return;
        }
        setIsLoading(true);
        try {
            const api = activeTab === 'foods' ? foodsApi : exercisesApi;
            const data = await api.search(searchQuery, userId);
            setItems(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const api = activeTab === 'foods' ? foodsApi : exercisesApi;
            await api.delete(id);
            loadData();
        } catch (error) {
            alert('Failed to delete: ' + error.message);
        }
    };

    const handleSave = async (item) => {
        try {
            const api = activeTab === 'foods' ? foodsApi : exercisesApi;

            if (editItem?.id) {
                await api.update(editItem.id, item);
            } else {
                // Add createdByUserId for custom items
                await api.create({ ...item, createdByUserId: userId });
            }

            setShowAddModal(false);
            setEditItem(null);
            loadData();
        } catch (error) {
            alert('Failed to save: ' + error.message);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 max-w-6xl mx-auto pb-10 animate-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                    Manage Foods & Exercises
                </h1>
                <p className="text-muted-foreground mt-1">Add or edit database items</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => { setActiveTab('foods'); setSelectedCategory('all'); }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all border ${activeTab === 'foods'
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                        : 'bg-card text-muted-foreground border-border hover:bg-muted'
                        }`}
                >
                    <Apple className="w-5 h-5" />
                    Foods
                </button>
                <button
                    onClick={() => { setActiveTab('exercises'); setSelectedCategory('all'); }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all border ${activeTab === 'exercises'
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                        : 'bg-card text-muted-foreground border-border hover:bg-muted'
                        }`}
                >
                    <Dumbbell className="w-5 h-5" />
                    Exercises
                </button>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-wrap gap-4 mb-6">
                {/* Search */}
                <div className="flex-1 min-w-64 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder={`Search ${activeTab}...`}
                        className="input-modern bg-background pl-12"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>

                {/* Category filter */}
                <div className="relative">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-full px-4 py-3 pr-8 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none min-w-[150px]"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                    </select>
                </div>

                {/* Add button */}
                <button
                    onClick={() => { setEditItem(null); setShowAddModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold btn-primary"
                >
                    <Plus className="w-5 h-5" />
                    Add {activeTab === 'foods' ? 'Food' : 'Exercise'}
                </button>
            </div>

            {/* Items Grid */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-md group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
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
                                </div>
                                <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
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

                            {activeTab === 'foods' ? (
                                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
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
                            ) : (
                                <div className="text-sm text-muted-foreground mt-4 pt-3 border-t border-border flex items-center gap-2">
                                    <span className="capitalize px-2 py-0.5 bg-muted rounded text-xs font-medium">{item.type}</span>
                                    {item.type === 'reps' && item.caloriesPerRep &&
                                        <span>• {item.caloriesPerRep} cal/rep</span>
                                    }
                                    {item.type === 'duration' && item.met &&
                                        <span>• MET: {item.met}</span>
                                    }
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {filteredItems.length === 0 && !isLoading && (
                <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border mt-6">
                    <p>No {activeTab} found matching your criteria.</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <ItemModal
                    type={activeTab}
                    item={editItem}
                    categories={categories}
                    onSave={handleSave}
                    onClose={() => { setShowAddModal(false); setEditItem(null); }}
                />
            )}
        </div>
    );
};

// Modal Component for Add/Edit
const ItemModal = ({ type, item, categories, onSave, onClose }) => {
    const isFood = type === 'foods';
    const [form, setForm] = useState(item || (isFood ? {
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        category: categories[0] || 'indian'
    } : {
        name: '',
        type: 'reps',
        caloriesPerRep: null,
        met: null,
        category: categories[0] || 'home'
    }));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(form);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
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
                                    <input
                                        type="number"
                                        value={form.calories}
                                        onChange={(e) => setForm({ ...form, calories: parseFloat(e.target.value) || 0 })}
                                        className="input-modern bg-background w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Protein (g)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.protein}
                                        onChange={(e) => setForm({ ...form, protein: parseFloat(e.target.value) || 0 })}
                                        className="input-modern bg-background w-full"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Carbs (g)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.carbs}
                                        onChange={(e) => setForm({ ...form, carbs: parseFloat(e.target.value) || 0 })}
                                        className="input-modern bg-background w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Fats (g)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.fats}
                                        onChange={(e) => setForm({ ...form, fats: parseFloat(e.target.value) || 0 })}
                                        className="input-modern bg-background w-full"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="input-modern bg-background w-full"
                                >
                                    <option value="reps">Reps-based</option>
                                    <option value="duration">Duration-based</option>
                                </select>
                            </div>
                            {form.type === 'reps' ? (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Calories per Rep</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.caloriesPerRep || ''}
                                        onChange={(e) => setForm({ ...form, caloriesPerRep: parseFloat(e.target.value) || null, met: null })}
                                        className="input-modern bg-background w-full"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">MET Value</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.met || ''}
                                        onChange={(e) => setForm({ ...form, met: parseFloat(e.target.value) || null, caloriesPerRep: null })}
                                        className="input-modern bg-background w-full"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold btn-primary flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Save
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminPage;
