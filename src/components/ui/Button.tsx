import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold uppercase tracking-wider shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all border';
  
  const variantStyles = {
    primary:
      'bg-primary text-[#102112] hover:bg-primary-dark border-[#d5ff90]/50 focus-visible:outline-primary shadow-[0_0_0_1px_rgba(143,230,77,0.28),inset_0_1px_0_rgba(255,255,255,0.22)]',
    secondary:
      'bg-[#26394d] text-[#d8e9fb] hover:bg-[#30485f] border-[#7292b1]/50 focus-visible:outline-[#7ca2c7]',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${disabled || isLoading ? disabledStyles : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
}; 
