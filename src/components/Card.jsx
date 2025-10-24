import React from 'react';

const Card = ({ children, className = '' }) => <div className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 ${className}`}>{children}</div>;

export default Card;
