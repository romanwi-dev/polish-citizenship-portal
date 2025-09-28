import React from "react";

interface TipPlaceholderProps {
  className?: string;
  children?: React.ReactNode;
  number?: number;
  variant?: string;
}

const TipPlaceholder: React.FC<TipPlaceholderProps> = ({ 
  className = "", 
  children, 
  number, 
  variant = "blue" 
}) => {
  const variantColors = {
    blue: "bg-blue-100 border-blue-300 text-blue-800",
    green: "bg-gray-100 border-gray-300 text-gray-800", 
    amber: "bg-gray-100 border-gray-300 text-gray-800",
    purple: "bg-gray-100 border-gray-300 text-gray-800",
    red: "bg-gray-100 border-gray-300 text-gray-800",
    indigo: "bg-gray-100 border-gray-300 text-gray-800"
  };

  const colorClass = variantColors[variant as keyof typeof variantColors] || variantColors.blue;

  return (
    <div className={`py-24 px-8 my-16 relative bg-gray-50 dark:bg-gray-900 ${className}`} style={{ 
      minHeight: '300px'
    }}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 text-white font-bold text-3xl shadow-lg mb-6">
            {number}
          </div>
          <h3 className="text-6xl lg:text-7xl font-bold text-black dark:text-white mb-4 leading-tight">
            Expert Tip
            <span className="block text-blue-600 dark:text-blue-400">
              Polish Citizenship Guidance
            </span>
          </h3>
        </div>
        <p className="text-2xl leading-relaxed font-medium text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
          Polish citizenship by descent requires careful documentation and legal expertise. 
          Each case is unique - trust the process and follow professional guidance for the best results.
        </p>
        {children}
      </div>
    </div>
  );
};

export default TipPlaceholder;