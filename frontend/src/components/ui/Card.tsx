import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white rounded-[5px] border border-[#f0f0f0] p-5 ${onClick ? 'cursor-pointer hover:bg-[#fafafa] transition-colors' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

export default Card;
