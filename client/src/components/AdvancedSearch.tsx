import { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Clock, Star, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

interface SearchSuggestion {
  id: string;
  text: string;
  category: 'document' | 'service' | 'legal' | 'general';
  url?: string;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  results: number;
}

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, filters?: SearchFilters) => void;
}

interface SearchFilters {
  category?: string;
  dateRange?: string;
  documentType?: string;
}

const searchSuggestions: SearchSuggestion[] = [
  { id: '1', text: 'Polish citizenship by descent', category: 'legal', url: '/polish-citizenship-law' },
  { id: '2', text: 'Birth certificate requirements', category: 'document', url: '/required-documents' },
  { id: '3', text: 'Document translation services', category: 'service', url: '/document-processing' },
  { id: '4', text: 'EU passport benefits', category: 'legal', url: '/eu-benefits' },
  { id: '5', text: 'Application timeline', category: 'general', url: '/dashboard' },
  { id: '6', text: 'Military records', category: 'document' },
  { id: '7', text: 'Genealogy research', category: 'service' },
  { id: '8', text: 'Consulate appointments', category: 'service' }
];

const categoryIcons = {
  document: '📄',
  service: '⚙️',
  legal: '⚖️',
  general: '💼'
};

export function AdvancedSearch({ isOpen, onClose, onSearch }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('searchHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSearchHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  // Auto-focus when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter suggestions based on query
  useEffect(() => {
    if (query.trim()) {
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [query]);

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    // Add to search history
    const historyItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query: searchQuery,
      timestamp: new Date(),
      results: Math.floor(Math.random() * 50) + 1 // Simulated results count
    };

    const newHistory = [historyItem, ...searchHistory.slice(0, 9)];
    setSearchHistory(newHistory);

    try {
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }

    onSearch(searchQuery, activeFilters);
    onClose();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.url) {
      window.location.href = suggestion.url;
    } else {
      setQuery(suggestion.text);
      handleSearch(suggestion.text);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl mx-4">
        {/* Search Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search Polish citizenship information..."
                className="pl-10 pr-4 py-3 text-lg border-gray-300 dark:border-gray-600"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={activeFilters.category || ''}
                    onChange={(e) => setActiveFilters({...activeFilters, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    <option value="document">Documents</option>
                    <option value="service">Services</option>
                    <option value="legal">Legal Information</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Document Type
                  </label>
                  <select
                    value={activeFilters.documentType || ''}
                    onChange={(e) => setActiveFilters({...activeFilters, documentType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Types</option>
                    <option value="birth">Birth Certificates</option>
                    <option value="marriage">Marriage Certificates</option>
                    <option value="military">Military Records</option>
                    <option value="passport">Passports</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={activeFilters.dateRange || ''}
                    onChange={(e) => setActiveFilters({...activeFilters, dateRange: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Any Time</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Content */}
        <div className="max-h-96 overflow-y-auto">
          {/* Suggestions */}
          {filteredSuggestions.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Suggestions</h3>
              <div className="space-y-2">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center space-x-3"
                  >
                    <span className="text-lg">{categoryIcons[suggestion.category]}</span>
                    <span className="text-gray-900 dark:text-white">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && !query && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Searches</h3>
                <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs">
                  Clear All
                </Button>
              </div>
              <div className="space-y-2">
                {searchHistory.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSearch(item.query)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{item.query}</span>
                    </div>
                    <span className="text-xs text-gray-500">{item.results} results</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleSearch('eligibility assessment')}>
                Check Eligibility
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSearch('required documents')}>
                View Documents
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSearch('application status')}>
                Track Application
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSearch('contact lawyer')}>
                Contact Expert
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}