import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, icon }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon && <div className="mb-4 text-gray-400">{icon}</div>}
    <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
