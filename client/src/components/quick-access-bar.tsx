import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Moon, 
  Sun, 
  Globe, 
  Palette, 
  Bot, 
  Search, 
  User,
  FileText,
  BarChart3,
  LogIn,
  UserPlus,
  MessageCircle,
  BookOpen
} from "lucide-react";
import { Link } from "wouter";

export default function QuickAccessBar() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const quickAccessItems: any[] = [];

  // Return null if no items to display - completely hide the component
  if (quickAccessItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900 py-8 px-4 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-4 gap-4">
          {quickAccessItems.map((item, index) => {
            const Icon = item.icon;
            
            if (item.href) {
              return (
                <Link key={index} href={item.href}>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer group">
                    <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition-transform ${item.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            }
            
            return (
              <button
                key={index}
                onClick={item.action}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
              >
                <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition-transform ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}