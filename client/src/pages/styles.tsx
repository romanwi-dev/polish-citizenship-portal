import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Styles() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Design System & Styles
          </h1>
          <p className="text-lg text-gray-600">
            Visual guidelines and design standards for PolishCitizenship.pl
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Color Palette */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Color Palette</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Primary Colors */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Colors</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-800 rounded-lg shadow"></div>
                  <div>
                    <div className="font-medium text-gray-900">Polish Red</div>
                    <div className="text-sm text-gray-600">#991B1B</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-800 rounded-lg shadow"></div>
                  <div>
                    <div className="font-medium text-gray-900">European Blue</div>
                    <div className="text-sm text-gray-600">#1E40AF</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg shadow"></div>
                  <div>
                    <div className="font-medium text-gray-900">Clean White</div>
                    <div className="text-sm text-gray-600">#FFFFFF</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Colors */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Secondary Colors</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg shadow border"></div>
                  <div>
                    <div className="font-medium text-gray-900">Light Gray</div>
                    <div className="text-sm text-gray-600">#F3F4F6</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-600 rounded-lg shadow"></div>
                  <div>
                    <div className="font-medium text-gray-900">Medium Gray</div>
                    <div className="text-sm text-gray-600">#4B5563</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg shadow"></div>
                  <div>
                    <div className="font-medium text-gray-900">Dark Gray</div>
                    <div className="text-sm text-gray-600">#111827</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accent Colors */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Accent Colors</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-amber-500 rounded-lg shadow"></div>
                  <div>
                    <div className="font-medium text-gray-900">Warning</div>
                    <div className="text-sm text-gray-600">#F59E0B</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-600 rounded-lg shadow"></div>
                  <div>
                    <div className="font-medium text-gray-900">Success</div>
                    <div className="text-sm text-gray-600">#059669</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-600 rounded-lg shadow"></div>
                  <div>
                    <div className="font-medium text-gray-900">Error</div>
                    <div className="text-sm text-gray-600">#DC2626</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Typography</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-8">
              
              {/* Headings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Headings</h3>
                <div className="space-y-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">Heading 1 - Polish Citizenship</h1>
                    <p className="text-sm text-gray-600 mt-1">4xl, font-bold</p>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Heading 2 - European Benefits</h2>
                    <p className="text-sm text-gray-600 mt-1">3xl, font-bold</p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">Heading 3 - Legal Services</h3>
                    <p className="text-sm text-gray-600 mt-1">2xl, font-semibold</p>
                  </div>
                </div>
              </div>

              {/* Body Text */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Body Text</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-lg text-gray-800">Large body text for important descriptions and introductions.</p>
                    <p className="text-sm text-gray-600 mt-1">lg, text-gray-800</p>
                  </div>
                  <div>
                    <p className="text-base text-gray-700">Regular body text for standard content and paragraphs.</p>
                    <p className="text-sm text-gray-600 mt-1">base, text-gray-700</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Small text for captions, labels, and secondary information.</p>
                    <p className="text-sm text-gray-600 mt-1">sm, text-gray-600</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Components */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">UI Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Buttons</h3>
              <div className="space-y-4">
                <Button className="bg-red-800 hover:bg-red-900 text-white">
                  Primary Button
                </Button>
                <Button variant="outline" className="border-blue-800 text-blue-800 hover:bg-blue-50">
                  Secondary Button
                </Button>
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
                  Ghost Button
                </Button>
              </div>
            </div>

            {/* Cards */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cards</h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-900 mb-2">Standard Card</h4>
                  <p className="text-sm text-gray-600">Basic card with border and hover effect</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Highlighted Card</h4>
                  <p className="text-sm text-blue-700">Important information card</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Layout Guidelines */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Layout Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Spacing System</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-300"></div>
                  <span className="text-sm">4px - xs spacing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-400"></div>
                  <span className="text-sm">8px - sm spacing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-500"></div>
                  <span className="text-sm">16px - base spacing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-600"></div>
                  <span className="text-sm">24px - lg spacing</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsive Breakpoints</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div>• Mobile: 320px - 767px</div>
                <div>• Tablet: 768px - 1023px</div>
                <div>• Desktop: 1024px - 1279px</div>
                <div>• Large: 1280px+</div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}