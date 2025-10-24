import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/Card';
import { UserCircle } from 'lucide-react';
import { setActiveProfileId, setPage } from '../store/slices/profileSlice';

const ProfileManagementPage = () => {
    const dispatch = useDispatch();
    const { userProfiles } = useSelector(state => state.profile);

    const handleProfileSelect = (profileId) => {
        dispatch(setActiveProfileId(profileId));
        dispatch(setPage('dashboard'));
    }

    return (<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900"><Card className="w-full max-w-sm"><h1 className="text-2xl font-bold text-center mb-4">Select Profile</h1><div className="space-y-2">{userProfiles.map(profile => (<div key={profile.id} onClick={() => handleProfileSelect(profile.id)} className="p-4 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 flex items-center gap-4"><UserCircle size={24} /><span>{profile.name}</span></div>))}</div></Card></div>);
};

export default ProfileManagementPage;