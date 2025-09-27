import { Input } from '@/components/ui/input';
import { forwardRef } from 'react';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isFilled?: boolean;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, isFilled, ...props }, ref) => {
    return (
      <Input
        {...props}
        ref={ref}
        className={`w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-400 focus:border-blue-500 rounded-2xl bg-gray-200 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg hover:bg-gray-100 focus:shadow-xl focus:border-2 focus:border-blue-600 ${isFilled ? 'bg-white border-green-400 shadow-md' : ''} ${className || ''}`}
      />
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";