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

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-background">
            <Card className="w-full max-w-sm border-border bg-card shadow-lg">
                <h1 className="text-2xl font-bold text-center mb-6 text-foreground">Select Profile</h1>
                <div className="space-y-3">
                    {userProfiles.map(profile => (
                        <div
                            key={profile.id}
                            onClick={() => handleProfileSelect(profile.id)}
                            className="p-4 bg-muted/50 rounded-xl cursor-pointer hover:bg-muted transition-colors flex items-center gap-4 border border-transparent hover:border-border"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserCircle size={24} className="text-primary" />
                            </div>
                            <span className="font-medium text-foreground">{profile.name}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default ProfileManagementPage;