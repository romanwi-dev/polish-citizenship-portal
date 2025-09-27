import { Link } from "wouter";
import { ClipboardCheck, User, BarChart3, Phone, TreePine, Bot, FolderOpen, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageToggleCompact } from "@/components/LanguageToggle";
import { useTheme } from "@/hooks/useTheme";

export function TopIconsRow() {
  const { t } = useTranslation();
  const [theme, setTheme, isDarkMode] = useTheme();

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'midnight';
    setTheme(newTheme);
  };


  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
      <div className="max-w-7xl mx-auto px-1 sm:px-4">
        <div className="flex items-center justify-around gap-1 py-2">
          {/* AI Agent */}
          <Link href="/agent">
            <div className="group relative min-w-0 flex-shrink-0">
              <div className="flex flex-col items-center gap-0.5 p-1.5 rounded bg-slate-50 border border-slate-300 hover:border-cyan-400 hover:bg-slate-100 transition-colors duration-200 cursor-pointer w-12 h-12 sm:w-14 sm:h-14">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-500 flex items-center justify-center group-hover:bg-cyan-500 transition-colors duration-200">
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="text-[9px] sm:text-xs font-semibold text-slate-600 group-hover:text-cyan-600 transition-colors whitespace-nowrap">{t('topIcons.agent')}</span>
              </div>
            </div>
          </Link>

          {/* Cases */}
          <Link href="/admin/cases">
            <div className="group relative min-w-0 flex-shrink-0">
              <div className="flex flex-col items-center gap-0.5 p-1.5 rounded bg-slate-50 border border-slate-300 hover:border-cyan-400 hover:bg-slate-100 transition-colors duration-200 cursor-pointer w-12 h-12 sm:w-14 sm:h-14">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-500 flex items-center justify-center group-hover:bg-cyan-500 transition-colors duration-200">
                  <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="text-[9px] sm:text-xs font-semibold text-slate-600 group-hover:text-cyan-600 transition-colors whitespace-nowrap">{t('topIcons.cases')}</span>
              </div>
            </div>
          </Link>

          {/* Citizenship Test */}
          <a 
            href="https://polishcitizenship.typeform.com/to/PS5ecU"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative min-w-0 flex-shrink-0"
          >
            <div className="flex flex-col items-center gap-0.5 p-1.5 rounded bg-slate-50 border border-slate-300 hover:border-cyan-400 hover:bg-slate-100 transition-colors duration-200 cursor-pointer w-12 h-12 sm:w-14 sm:h-14">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-500 flex items-center justify-center group-hover:bg-cyan-500 transition-colors duration-200">
                <ClipboardCheck className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-cyan-600 transition-colors whitespace-nowrap">{t('topIcons.test')}</span>
            </div>
          </a>

          {/* Family Tree */}
          <Link href="/family-tree">
            <div className="group relative min-w-0 flex-shrink-0">
              <div className="flex flex-col items-center gap-0.5 p-1.5 rounded bg-slate-50 border border-slate-300 hover:border-cyan-400 hover:bg-slate-100 transition-colors duration-200 cursor-pointer w-12 h-12 sm:w-14 sm:h-14">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-500 flex items-center justify-center group-hover:bg-cyan-500 transition-colors duration-200">
                  <TreePine className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="text-[9px] sm:text-xs font-semibold text-slate-600 group-hover:text-cyan-600 transition-colors whitespace-nowrap">{t('topIcons.tree')}</span>
              </div>
            </div>
          </Link>

          {/* Account (Combined Register/Login) */}
          <Link href="/auth">
            <div className="group relative min-w-0 flex-shrink-0">
              <div className="flex flex-col items-center gap-0.5 p-1.5 rounded bg-slate-50 border border-slate-300 hover:border-cyan-400 hover:bg-slate-100 transition-colors duration-200 cursor-pointer w-12 h-12 sm:w-14 sm:h-14">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-500 flex items-center justify-center group-hover:bg-cyan-500 transition-colors duration-200">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="text-[9px] sm:text-xs font-semibold text-slate-600 group-hover:text-cyan-600 transition-colors whitespace-nowrap">{t('topIcons.account')}</span>
              </div>
            </div>
          </Link>

          {/* Dashboard/Papers */}
          <Link href="/dashboard">
            <div className="group relative min-w-0 flex-shrink-0">
              <div className="flex flex-col items-center gap-0.5 p-1.5 rounded bg-slate-50 border border-slate-300 hover:border-cyan-400 hover:bg-slate-100 transition-colors duration-200 cursor-pointer w-12 h-12 sm:w-14 sm:h-14">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-500 flex items-center justify-center group-hover:bg-cyan-500 transition-colors duration-200">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="text-[9px] sm:text-xs font-semibold text-slate-600 group-hover:text-cyan-600 transition-colors whitespace-nowrap">{t('topIcons.papers')}</span>
              </div>
            </div>
          </Link>

          {/* Contact */}
          <button 
            onClick={() => {
              const element = document.getElementById('contact');
              if (element && typeof element.getBoundingClientRect === 'function') {
                const navHeight = 120;
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - navHeight;
                
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth'
                });
              }
            }}
            className="group relative min-w-0 flex-shrink-0 border-none outline-none bg-transparent hover:bg-transparent focus:outline-none"
          >
            <div className="flex flex-col items-center gap-0.5 p-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-cyan-400 dark:hover:border-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer w-12 h-12 sm:w-14 sm:h-14">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-500 dark:bg-slate-400 flex items-center justify-center group-hover:bg-cyan-500 transition-colors duration-200">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="text-[9px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-cyan-600 transition-colors whitespace-nowrap">{t('topIcons.contact')}</span>
            </div>
          </button>

          {/* Language Toggle */}
          <div className="group relative min-w-0 flex-shrink-0">
            <div className="flex flex-col items-center gap-0.5 p-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-cyan-400 dark:hover:border-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer w-12 h-12 sm:w-14 sm:h-14">
              <LanguageToggleCompact />
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleTheme}
            className="group relative min-w-0 flex-shrink-0 border-none outline-none bg-transparent hover:bg-transparent focus:outline-none"
            data-testid="button-dark-mode-toggle"
          >
            <div className="flex flex-col items-center gap-0.5 p-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-cyan-400 dark:hover:border-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer w-12 h-12 sm:w-14 sm:h-14">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-500 dark:bg-slate-400 flex items-center justify-center group-hover:bg-cyan-500 transition-colors duration-200">
                {isDarkMode ? (
                  <Sun className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                ) : (
                  <Moon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                )}
              </div>
              <span className="text-[9px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-cyan-600 transition-colors whitespace-nowrap">
                {isDarkMode ? t('topIcons.light') : t('topIcons.dark')}
              </span>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}