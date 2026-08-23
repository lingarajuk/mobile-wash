import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There is nothing to display right now.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-3xl border border-[#E6ECF5] shadow-xs ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-[#F0F6FF] border border-[#BFDBFE] text-[#1264F5] flex items-center justify-center mb-4 shadow-xs">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-lg font-black text-[#10213F] mb-1">{title}</h4>
      <p className="text-sm text-[#64748B] max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
