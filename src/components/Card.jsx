import React from 'react';

const Card = ({ children, className = '', hover = true }) => (
    <div
        className={`
            bg-white dark:bg-gray-800 
            rounded-2xl 
            shadow-lg shadow-gray-200/50 dark:shadow-black/20
            border border-gray-100 dark:border-gray-700/50
            p-4 sm:p-6 
            transition-all duration-300 ease-out
            ${hover ? 'hover:shadow-xl hover:shadow-gray-200/60 dark:hover:shadow-black/30 hover:-translate-y-1' : ''}
            ${className}
        `}
    >
        {children}
    </div>
);

export default Card;

