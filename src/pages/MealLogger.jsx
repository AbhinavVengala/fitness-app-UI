import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/Card';
import { Search, Plus, Trash2 } from 'lucide-react';
import { combinedFoodDatabase } from '../data/database';
import { addFood, removeFood } from '../store/slices/dataSlice';

const MealLogger = () => {
    const dispatch = useDispatch();
    const { foodLog } = useSelector(state => state.data);
    const { authUser } = useSelector(state => state.auth);
    const { activeProfileId } = useSelector(state => state.profile);
    const [searchTerm, setSearchTerm] = useState('');
    const [mealType, setMealType] = useState('snack');

    const searchResults = useMemo(() => { 
        if (!searchTerm.trim()) return []; 
        const lowerCaseSearch = searchTerm.toLowerCase(); 
        return combinedFoodDatabase.filter(food => food.name.toLowerCase().includes(lowerCaseSearch)); 
    }, [searchTerm]);

    const handleAddFood = (food) => { 
        dispatch(addFood({ authUser, profileId: activeProfileId, food: { ...food, meal: mealType } }));
        setSearchTerm(''); 
    };

    const handleRemoveFood = (foodId) => {
        dispatch(removeFood({ authUser, profileId: activeProfileId, foodId }));
    };

    return (<div className="space-y-6"><h1 className="text-3xl font-bold text-center">Meal Log</h1><Card><h2 className="text-xl font-bold mb-4">Add Food</h2><div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Search for a food..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-full"/></div><div className="flex justify-center gap-2 mb-4">{['breakfast', 'lunch', 'dinner', 'snack'].map(type => <button key={type} onClick={() => setMealType(type)} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${mealType === type ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</button>)}</div>{searchTerm && <div className="max-h-60 overflow-y-auto">{searchResults.map((item, index) => (<div key={index} className="flex justify-between items-center p-2 hover:bg-gray-100"><div><p>{item.name}</p><p className="text-sm text-gray-500">{item.calories} kcal</p></div><button onClick={() => handleAddFood(item)} className="bg-green-500 text-white p-2 rounded-full"><Plus size={16} /></button></div>))}</div>}</Card><Card><h2 className="text-xl font-bold mb-2">Today's Log</h2><ul className="divide-y">{foodLog.map(food => <li key={food.id} className="flex justify-between items-center py-2"><div><p>{food.name}</p><p className="text-sm text-gray-500">{food.meal}</p></div><div className="flex items-center gap-4"><span>{food.calories} kcal</span><button onClick={() => handleRemoveFood(food.id)} className="text-red-500"><Trash2 size={18} /></button></div></li>)}</ul></Card></div>);
};

export default MealLogger;