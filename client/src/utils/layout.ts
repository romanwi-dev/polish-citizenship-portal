import { Layout } from 'react-grid-layout';

// Grid configuration constants
export const GRID_CONFIG = {
  COLS: { lg: 12, md: 8, sm: 4, xs: 1 }, // WIDE cards on mobile, narrow cards on desktop
  ROW_HEIGHT: 14,
  MARGINS: [8, 8] as [number, number],
  DEFAULTS: {
    w: 4,  // Desktop: 4/12=33% narrow cards, Mobile: 4/1=100% WIDE cards
    h: 12,  // Taller card height for better content
    minW: 1, // Allow shrinking on small screens
    minH: 8,
    maxW: 6, // Maximum width constraint
    maxH: 20 // Maximum height - must be >= h and >= minH
  }
} as const;

// Special handling for very small screens
export const MOBILE_COLS = { xs: 1 }; // Single column on <380px

export interface LayoutItem extends Layout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

/**
 * Generate default layout for case cards
 * @param caseIds Array of case IDs to create layout for
 * @returns Array of layout items with default positioning
 */
export function generateDefaultLayout(caseIds: string[]): LayoutItem[] {
  const { DEFAULTS } = GRID_CONFIG;
  
  return caseIds.map((caseId, index) => {
    // Calculate grid position (3 cards per row on large screens)
    const cardsPerRow = Math.floor(GRID_CONFIG.COLS.lg / DEFAULTS.w);
    const row = Math.floor(index / cardsPerRow);
    const col = (index % cardsPerRow) * DEFAULTS.w;
    
    return {
      i: caseId,
      x: col,
      y: row * DEFAULTS.h,
      w: DEFAULTS.w,
      h: DEFAULTS.h,
      minW: DEFAULTS.minW,
      minH: DEFAULTS.minH,
      maxW: DEFAULTS.maxW,
      maxH: DEFAULTS.maxH,
      isDraggable: true,
      isResizable: true
    };
  });
}

/**
 * Load layout from localStorage with user-specific key
 * @param caseIds Array of current case IDs
 * @param userId Optional user ID for personalized storage
 * @param storageKey Base storage key (default: 'cases_layout_v2')
 * @returns Layout array with fallback to defaults
 */
export function loadLayout(
  caseIds: string[], 
  userId?: string, 
  storageKey: string = 'cases_layout_v2'
): LayoutItem[] {
  try {
    const key = userId ? `${storageKey}::${userId}` : storageKey;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return generateDefaultLayout(caseIds);
    }
    
    const parsedLayout: LayoutItem[] = JSON.parse(stored);
    
    // Validate and merge with current case IDs
    const layoutMap = new Map(parsedLayout.map(item => [item.i, item]));
    const mergedLayout: LayoutItem[] = [];
    
    // Add existing layouts for current cases
    caseIds.forEach(caseId => {
      const existingItem = layoutMap.get(caseId);
      if (existingItem) {
        // Ensure required properties are present and fix height constraints
        mergedLayout.push({
          ...existingItem,
          isDraggable: existingItem.isDraggable !== false,
          isResizable: existingItem.isResizable !== false,
          // Fix missing or invalid height constraints
          minH: existingItem.minH || GRID_CONFIG.DEFAULTS.minH,
          maxH: existingItem.maxH || GRID_CONFIG.DEFAULTS.maxH,
          h: existingItem.h || GRID_CONFIG.DEFAULTS.h
        });
      }
    });
    
    // Add new cases that don't have layout yet
    const newCaseIds = caseIds.filter(id => !layoutMap.has(id));
    if (newCaseIds.length > 0) {
      const newLayouts = generateDefaultLayout(newCaseIds);
      // Position new cards after existing ones
      const maxY = mergedLayout.length > 0 
        ? Math.max(...mergedLayout.map(item => item.y + item.h))
        : 0;
      
      // Calculate cards per row based on grid configuration
      const cardsPerRow = Math.max(1, Math.floor(GRID_CONFIG.COLS.lg / GRID_CONFIG.DEFAULTS.w));
      
      newLayouts.forEach((layout, index) => {
        layout.y = maxY + Math.floor(index / cardsPerRow) * GRID_CONFIG.DEFAULTS.h;
        mergedLayout.push(layout);
      });
    }
    
    return mergedLayout.length > 0 ? mergedLayout : generateDefaultLayout(caseIds);
    
  } catch (error) {
    console.warn('Failed to load layout from localStorage:', error);
    return generateDefaultLayout(caseIds);
  }
}

/**
 * Save layout to localStorage with user-specific key
 * @param layout Layout array to save
 * @param userId Optional user ID for personalized storage
 * @param storageKey Base storage key (default: 'cases_layout_v2')
 */
export function saveLayout(
  layout: LayoutItem[], 
  userId?: string, 
  storageKey: string = 'cases_layout_v2'
): void {
  try {
    const key = userId ? `${storageKey}::${userId}` : storageKey;
    localStorage.setItem(key, JSON.stringify(layout));
  } catch (error) {
    console.warn('Failed to save layout to localStorage:', error);
  }
}

/**
 * Clear stored layout and reset to defaults
 * @param caseIds Current case IDs for generating new defaults
 * @param userId Optional user ID for personalized storage
 * @param storageKey Base storage key (default: 'cases_layout_v2')
 * @returns New default layout
 */
export function resetLayout(
  caseIds: string[], 
  userId?: string, 
  storageKey: string = 'cases_layout_v2'
): LayoutItem[] {
  try {
    const key = userId ? `${storageKey}::${userId}` : storageKey;
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear layout from localStorage:', error);
  }
  
  return generateDefaultLayout(caseIds);
}

/**
 * Handle layout changes with validation and persistence
 * @param newLayout New layout from react-grid-layout
 * @param caseIds Current case IDs
 * @param userId Optional user ID
 * @param onSave Optional callback after successful save
 */
export function handleLayoutChange(
  newLayout: Layout[],
  caseIds: string[],
  userId?: string,
  onSave?: (layout: LayoutItem[]) => void
): LayoutItem[] {
  // Convert and validate layout
  const validatedLayout: LayoutItem[] = newLayout
    .filter(item => caseIds.includes(item.i))
    .map(item => ({
      ...item,
      minW: GRID_CONFIG.DEFAULTS.minW,
      minH: GRID_CONFIG.DEFAULTS.minH,
      maxW: GRID_CONFIG.DEFAULTS.maxW,
      isDraggable: true,
      isResizable: true
    }));
  
  // Save to localStorage
  saveLayout(validatedLayout, userId);
  
  // Optional callback
  if (onSave) {
    onSave(validatedLayout);
  }
  
  return validatedLayout;
}

/**
 * Get responsive breakpoints for different screen sizes
 * @param isVerySmall Whether screen is <380px (forces single column)
 */
export function getResponsiveBreakpoints(isVerySmall: boolean = false) {
  const baseBreakpoints = {
    lg: 1200,
    md: 768,  // Single column below 768px (mobile)
    sm: 380,  // Very small mobile
    xs: 0
  };
  
  // On very small screens, adjust breakpoints to force single column earlier
  if (isVerySmall) {
    return {
      ...baseBreakpoints,
      md: 768, // Force single column at mobile breakpoint
      sm: 0,
      xs: 0
    };
  }
  
  return baseBreakpoints;
}

/**
 * Get column configuration based on screen size
 * @param isVerySmall Whether to force single column layout
 */
export function getColumnConfig(isVerySmall: boolean = false) {
  if (isVerySmall) {
    return { ...GRID_CONFIG.COLS, xs: 1 };
  }
  return GRID_CONFIG.COLS;
}

/**
 * Create live region announcement for accessibility
 * @param layout Current layout item
 * @param action Type of action performed
 */
export function createAccessibilityAnnouncement(
  layout: LayoutItem, 
  action: 'moved' | 'resized'
): string {
  const { x, y, w, h } = layout;
  
  if (action === 'moved') {
    return `Card moved to column ${x + 1}, row ${y + 1}`;
  } else {
    return `Card resized to ${w} columns wide, ${h} rows tall`;
  }
}