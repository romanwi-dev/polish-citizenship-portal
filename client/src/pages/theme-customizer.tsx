import React from 'react';
import { ColorPaletteGenerator } from '@/components/ColorPaletteGenerator';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function ThemeCustomizer() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Theme Customizer</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create beautiful, accessible color palettes for your application
            </p>
          </div>

          <ColorPaletteGenerator />

          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">How to Use</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>1. Choose a Base Color:</strong> Select your primary brand color or upload an image to extract colors
              </p>
              <p>
                <strong>2. Select a Palette Mode:</strong> Different modes create different color relationships
              </p>
              <p>
                <strong>3. Generate & Preview:</strong> See how your palette looks and make adjustments
              </p>
              <p>
                <strong>4. Apply & Save:</strong> Apply the palette to see it in action across the application
              </p>
              <p>
                <strong>5. Export:</strong> Download your palette as JSON or CSS for use in other projects
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Complementary</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Colors opposite on the color wheel. High contrast and vibrant.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Analogous</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Colors next to each other. Harmonious and pleasing.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Triadic</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Three evenly spaced colors. Balanced and vibrant.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Tetradic</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Four colors in two complementary pairs. Rich and diverse.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Monochromatic</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Different shades of one color. Clean and elegant.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Split-Complementary</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Base color plus two adjacent to complement. Vibrant but balanced.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}