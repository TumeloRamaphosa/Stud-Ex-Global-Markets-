'use client';

import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  containerClassName?: string;
}

export default function Textarea({
  label,
  error,
  helper,
  containerClassName,
  className,
  ...props
}: TextareaProps) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          'w-full rounded-lg border border-primary-100 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      {helper && !error && <p className="mt-1 text-sm text-slate-500">{helper}</p>}
    </div>
  );
}
