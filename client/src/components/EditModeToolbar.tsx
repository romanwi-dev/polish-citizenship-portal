// EditModeContext removed - disabled edit mode
import { Edit3, Eye, Save, X, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

export function EditModeToolbar() {
  const isEditMode = false; // Edit mode disabled
  const toggleEditMode = () => {}; // Disabled
  const [isMinimized, setIsMinimized] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Card 
      className={`sticky top-0 left-0 right-0 z-50 mx-0 rounded-none border-x-0 border-t-0 shadow-lg transition-all duration-300 backdrop-blur-sm ${
        isEditMode 
          ? 'border-orange-500/50 bg-orange-50/95' 
          : 'border-gray-200/50 bg-white/95'
      }`}
      data-testid="edit-mode-toolbar"
    >
      {isMinimized ? (
        <div className="flex items-center justify-between px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(false)}
            className="p-2 h-8 w-8"
            title="Expand toolbar"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            className="p-2 h-8 w-8"
            title="Scroll to top"
            data-testid="scroll-to-top-button"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-2 py-1 rounded text-sm font-medium backdrop-blur-sm ${
              isEditMode 
                ? 'text-gray-700 bg-white/10 border border-gray-200/10' 
                : 'text-gray-700 bg-gray-100/10 border border-gray-200/10'
            }`}>
              {isEditMode ? (
                <>
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Mode</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>View Mode</span>
                </>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleEditMode}
              className="h-8 bg-white/10 backdrop-blur-sm border border-gray-200/10 hover:bg-white/20 transition-all text-gray-700"
              data-testid="toggle-edit-mode-button"
            >
              {isEditMode ? (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Exit Edit
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit Page
                </>
              )}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className="p-2 h-8 w-8"
              title="Scroll to top"
              data-testid="scroll-to-top-button"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="p-2 h-8 w-8"
              title="Minimize toolbar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {isEditMode && !isMinimized && (
        <div className="px-4 pb-2 border-t border-orange-200">
          <div className="text-xs text-orange-600 flex items-center gap-1 justify-center">
            <span>💡</span>
            <span>Click any text to edit • Press Ctrl+E to exit</span>
          </div>
        </div>
      )}
    </Card>
  );
}