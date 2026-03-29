import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({
  label,
  error,
  className = '',
  ...props
}: InputProps) => {
  return (
    <div>
      <label
        htmlFor={props.id}
        className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#b8cde3]"
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          className={`block w-full rounded-sm border py-2.5 px-3.5 text-[#e9f4ff] shadow-sm ${
            error
              ? 'border-[#e8584f]/80 bg-[#2e1718]'
              : 'border-[#5f7c99]/50 bg-[#182534]'
          } placeholder:text-[#7f9ab5] focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-xs text-[#ff8f7f]">{error}</p>
      )}
    </div>
  );
}; 
