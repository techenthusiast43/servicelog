import React from 'react';
import { ServiceStatus } from '../types/service';
import { getStatusMeta } from '../utils/formatters';

interface StatusBadgeProps {
  status: ServiceStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const meta = getStatusMeta(status);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${status === ServiceStatus.Pending ? 'animate-ping' : ''}`} />
      <span>{meta.label}</span>
    </span>
  );
};

