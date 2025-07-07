'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  onClick?: () => void;
}

export function EnhancedCard({
  title,
  description,
  icon: Icon,
  className,
  onClick
}: EnhancedCardProps) {
  return (
    <article
      className={cn(
        "bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-200 transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-lg",
        className
      )}
      onClick={onClick}
    >
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </article>
  );
} 