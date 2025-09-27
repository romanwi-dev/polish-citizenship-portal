/**
 * Adaptive Color Palette Generator
 * Provides utilities for generating harmonious color palettes
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export type PaletteMode = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic' | 'split-complementary';

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(rgb: RGB): string {
  return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Calculate relative luminance for accessibility
 */
export function getLuminance(rgb: RGB): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(rgb1: RGB, rgb2: RGB): number {
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Generate a color with good contrast against the background
 */
export function getContrastingColor(background: RGB, preferLight: boolean = true): RGB {
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  
  const whiteContrast = getContrastRatio(background, white);
  const blackContrast = getContrastRatio(background, black);
  
  // WCAG AA standard requires contrast ratio of at least 4.5:1
  if (preferLight && whiteContrast >= 4.5) {
    return white;
  } else if (!preferLight && blackContrast >= 4.5) {
    return black;
  }
  
  return whiteContrast > blackContrast ? white : black;
}

/**
 * Generate complementary colors
 */
export function generateComplementary(baseColor: string): string[] {
  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb);
  
  const complementary = { ...hsl, h: (hsl.h + 180) % 360 };
  
  return [
    baseColor,
    rgbToHex(hslToRgb(complementary))
  ];
}

/**
 * Generate analogous colors
 */
export function generateAnalogous(baseColor: string): string[] {
  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb);
  
  return [
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h - 30 + 360) % 360 })),
    baseColor,
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 30) % 360 }))
  ];
}

/**
 * Generate triadic colors
 */
export function generateTriadic(baseColor: string): string[] {
  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb);
  
  return [
    baseColor,
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 120) % 360 })),
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 240) % 360 }))
  ];
}

/**
 * Generate tetradic colors
 */
export function generateTetradic(baseColor: string): string[] {
  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb);
  
  return [
    baseColor,
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 90) % 360 })),
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 180) % 360 })),
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 270) % 360 }))
  ];
}

/**
 * Generate monochromatic colors
 */
export function generateMonochromatic(baseColor: string): string[] {
  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb);
  
  return [
    rgbToHex(hslToRgb({ ...hsl, l: Math.max(10, hsl.l - 30) })),
    rgbToHex(hslToRgb({ ...hsl, l: Math.max(10, hsl.l - 15) })),
    baseColor,
    rgbToHex(hslToRgb({ ...hsl, l: Math.min(90, hsl.l + 15) })),
    rgbToHex(hslToRgb({ ...hsl, l: Math.min(90, hsl.l + 30) }))
  ];
}

/**
 * Generate split-complementary colors
 */
export function generateSplitComplementary(baseColor: string): string[] {
  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb);
  
  return [
    baseColor,
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 150) % 360 })),
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 210) % 360 }))
  ];
}

/**
 * Generate a complete color palette based on a base color and mode
 */
export function generatePalette(baseColor: string, mode: PaletteMode = 'complementary'): ColorPalette {
  let colors: string[] = [];
  
  switch (mode) {
    case 'complementary':
      colors = generateComplementary(baseColor);
      break;
    case 'analogous':
      colors = generateAnalogous(baseColor);
      break;
    case 'triadic':
      colors = generateTriadic(baseColor);
      break;
    case 'tetradic':
      colors = generateTetradic(baseColor);
      break;
    case 'monochromatic':
      colors = generateMonochromatic(baseColor);
      break;
    case 'split-complementary':
      colors = generateSplitComplementary(baseColor);
      break;
  }
  
  const primaryRgb = hexToRgb(baseColor);
  const primaryHsl = rgbToHsl(primaryRgb);
  
  // Generate shades and tints
  const background = rgbToHex(hslToRgb({ ...primaryHsl, s: 5, l: 98 }));
  const surface = rgbToHex(hslToRgb({ ...primaryHsl, s: 10, l: 95 }));
  const border = rgbToHex(hslToRgb({ ...primaryHsl, s: 15, l: 85 }));
  
  // Generate text colors with proper contrast
  const backgroundRgb = hexToRgb(background);
  const text = rgbToHex(getContrastingColor(backgroundRgb, false));
  const textMuted = rgbToHex(hslToRgb({ ...rgbToHsl(hexToRgb(text)), l: 45 }));
  
  // Generate semantic colors
  const error = '#ef4444';
  const warning = '#f59e0b';
  const success = '#10b981';
  const info = '#3b82f6';
  
  return {
    primary: baseColor,
    secondary: colors[1] || baseColor,
    tertiary: colors[2] || colors[1] || baseColor,
    accent: colors[colors.length - 1] || baseColor,
    background,
    surface,
    text,
    textMuted,
    border,
    error,
    warning,
    success,
    info
  };
}

/**
 * Extract dominant colors from image data
 */
export async function extractColorsFromImage(imageUrl: string, count: number = 5): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Scale down for performance
      const maxSize = 100;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // Simple color quantization
      const colorMap = new Map<string, number>();
      
      for (let i = 0; i < pixels.length; i += 4) {
        // Quantize to reduce color space
        const r = Math.floor(pixels[i] / 32) * 32;
        const g = Math.floor(pixels[i + 1] / 32) * 32;
        const b = Math.floor(pixels[i + 2] / 32) * 32;
        
        const hex = rgbToHex({ r, g, b });
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }
      
      // Sort by frequency and return top colors
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([color]) => color);
      
      resolve(sortedColors);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Apply a color palette to CSS variables
 */
export function applyPaletteToCSS(palette: ColorPalette): void {
  const root = document.documentElement;
  
  // Convert hex colors to HSL for CSS variables
  Object.entries(palette).forEach(([key, value]) => {
    const rgb = hexToRgb(value);
    const hsl = rgbToHsl(rgb);
    root.style.setProperty(`--color-${key}`, `${hsl.h} ${hsl.s}% ${hsl.l}%`);
  });
  
  // Store palette in localStorage
  localStorage.setItem('customPalette', JSON.stringify(palette));
}

/**
 * Load saved palette from localStorage
 */
export function loadSavedPalette(): ColorPalette | null {
  const saved = localStorage.getItem('customPalette');
  return saved ? JSON.parse(saved) : null;
}

/**
 * Reset to default palette
 */
export function resetPalette(): void {
  localStorage.removeItem('customPalette');
  const root = document.documentElement;
  
  // Remove custom properties
  const styles = root.style;
  const toRemove: string[] = [];
  
  for (let i = 0; i < styles.length; i++) {
    const prop = styles[i];
    if (prop.startsWith('--color-')) {
      toRemove.push(prop);
    }
  }
  
  toRemove.forEach(prop => root.style.removeProperty(prop));
}