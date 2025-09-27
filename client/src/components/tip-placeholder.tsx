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
    green: "bg-green-100 border-green-300 text-green-800", 
    amber: "bg-amber-100 border-amber-300 text-amber-800",
    purple: "bg-purple-100 border-purple-300 text-purple-800",
    red: "bg-red-100 border-red-300 text-red-800",
    indigo: "bg-indigo-100 border-indigo-300 text-indigo-800"
  };

  const colorClass = variantColors[variant as keyof typeof variantColors] || variantColors.blue;

  return (
    <div className={`p-8 my-12 border-4 rounded-2xl shadow-lg ${colorClass} ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center font-bold text-xl shadow-md">
          {number}
        </div>
        <h3 className="text-2xl font-bold">INFO #{number}</h3>
      </div>
      <p className="text-lg leading-relaxed font-medium">
        <strong>Expert Tip:</strong> Polish citizenship by descent requires careful documentation and legal expertise. 
        Each case is unique - trust the process and follow professional guidance for the best results.
      </p>
      {children}
    </div>
  );
};

export default TipPlaceholder;