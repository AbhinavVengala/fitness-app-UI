import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPage } from '../store/slices/profileSlice';

const NavItem = ({ pageName, icon: Icon }) => {
    const dispatch = useDispatch();
    const { page } = useSelector(state => state.profile);
    const isActive = page === pageName;
    return (<button onClick={() => dispatch(setPage(pageName))} className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${isActive ? 'text-blue-500' : 'text-gray-500'}`}><Icon size={24} /><span className="text-xs mt-1 font-medium capitalize">{pageName}</span></button>);
};

export default NavItem;