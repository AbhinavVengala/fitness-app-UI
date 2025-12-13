import React from 'react';

const Card = ({ children, className = '', hover = false }) => (
    <div
        className={`
            rounded-xl 
            bg-card text-card-foreground
            border border-border
            shadow-sm
            p-6 
            transition-all duration-300
            ${hover ? 'hover:shadow-md hover:-translate-y-1' : ''}
            ${className}
        `}
    >
        {children}
    </div>
);

export default Card;

