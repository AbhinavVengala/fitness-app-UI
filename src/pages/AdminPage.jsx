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
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                Manage Foods & Exercises
            </h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => { setActiveTab('foods'); setSelectedCategory('all'); }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'foods'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                >
                    <Apple className="w-5 h-5" />
                    Foods
                </button>
                <button
                    onClick={() => { setActiveTab('exercises'); setSelectedCategory('all'); }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'exercises'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
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
                        className="w-full px-4 py-3 pl-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>

                {/* Category filter */}
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                </select>

                {/* Add button */}
                <button
                    onClick={() => { setEditItem(null); setShowAddModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add {activeTab === 'foods' ? 'Food' : 'Exercise'}
                </button>
            </div>

            {/* Items Grid */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-semibold text-slate-800 dark:text-white">
                                        {item.name}
                                    </h3>
                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                        {item.category}
                                    </span>
                                    {item.createdByUserId && (
                                        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                            Custom
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => { setEditItem(item); setShowAddModal(true); }}
                                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'foods' ? (
                                <div className="grid grid-cols-4 gap-2 text-xs text-slate-500 dark:text-slate-400 mt-3">
                                    <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div className="font-bold text-slate-700 dark:text-slate-200">{item.calories}</div>
                                        <div>kcal</div>
                                    </div>
                                    <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div className="font-bold text-slate-700 dark:text-slate-200">{item.protein}g</div>
                                        <div>Protein</div>
                                    </div>
                                    <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div className="font-bold text-slate-700 dark:text-slate-200">{item.carbs}g</div>
                                        <div>Carbs</div>
                                    </div>
                                    <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div className="font-bold text-slate-700 dark:text-slate-200">{item.fats}g</div>
                                        <div>Fats</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                                    <span className="capitalize">{item.type}</span>
                                    {item.type === 'reps' && item.caloriesPerRep &&
                                        <span> • {item.caloriesPerRep} cal/rep</span>
                                    }
                                    {item.type === 'duration' && item.met &&
                                        <span> • MET: {item.met}</span>
                                    }
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {filteredItems.length === 0 && !isLoading && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    No {activeTab} found. Add some!
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {item ? 'Edit' : 'Add'} {isFood ? 'Food' : 'Exercise'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
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
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Calories</label>
                                    <input
                                        type="number"
                                        value={form.calories}
                                        onChange={(e) => setForm({ ...form, calories: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Protein (g)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.protein}
                                        onChange={(e) => setForm({ ...form, protein: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Carbs (g)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.carbs}
                                        onChange={(e) => setForm({ ...form, carbs: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fats (g)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.fats}
                                        onChange={(e) => setForm({ ...form, fats: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                                >
                                    <option value="reps">Reps-based</option>
                                    <option value="duration">Duration-based</option>
                                </select>
                            </div>
                            {form.type === 'reps' ? (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Calories per Rep</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.caloriesPerRep || ''}
                                        onChange={(e) => setForm({ ...form, caloriesPerRep: parseFloat(e.target.value) || null, met: null })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">MET Value (Metabolic Equivalent)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.met || ''}
                                        onChange={(e) => setForm({ ...form, met: parseFloat(e.target.value) || null, caloriesPerRep: null })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
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
