import React, { useState } from 'react';
import { Link } from 'wouter';
import { Menu, X, Languages } from 'lucide-react';

export default function MobileNavTest() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay - ALWAYS VISIBLE FOR TEST */}
      <div className={`fixed inset-0 bg-white z-40 overflow-y-auto p-4 ${isOpen ? 'block' : 'block'}`}>
        <div className="pt-16">
          
          {/* TEST HEADER */}
          <div className="bg-green-500 text-white text-center py-4 mb-4 rounded font-bold text-2xl">
            🟢 NEW MOBILE MENU - ALWAYS VISIBLE
          </div>

          {/* Services Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 px-2 border-b-2 border-gray-200 pb-2">SERVICES</h3>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded">Legal Expertise</div>
              <div className="p-3 bg-gray-50 rounded">Our Process</div>
              <div className="p-3 bg-gray-50 rounded">Success Stories</div>
            </div>
          </div>

          {/* LANDINGS SECTION - HIGHLY VISIBLE */}
          <div className="mb-6">
            <div className="bg-red-500 text-white text-center py-4 mb-4 rounded font-bold text-2xl">
              🚨 MULTILINGUAL LANDINGS SECTION 🚨
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-3 px-2 border-b-2 border-red-500 pb-2">🌍 LANDINGS</h3>
            <div className="space-y-3">
              <Link href="/es" className="block p-4 bg-red-100 rounded-lg border-2 border-red-300 hover:bg-red-200">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-red-600" />
                  <span className="font-bold text-red-800">🇪🇸 Spanish Landing</span>
                </div>
              </Link>
              <Link href="/pt" className="block p-4 bg-red-100 rounded-lg border-2 border-red-300 hover:bg-red-200">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-red-600" />
                  <span className="font-bold text-red-800">🇧🇷 Portuguese Landing</span>
                </div>
              </Link>
              <Link href="/fr" className="block p-4 bg-red-100 rounded-lg border-2 border-red-300 hover:bg-red-200">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-red-600" />
                  <span className="font-bold text-red-800">🇫🇷 French Landing</span>
                </div>
              </Link>
              <Link href="/de" className="block p-4 bg-red-100 rounded-lg border-2 border-red-300 hover:bg-red-200">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-red-600" />
                  <span className="font-bold text-red-800">🇩🇪 German Landing</span>
                </div>
              </Link>
              <Link href="/he" className="block p-4 bg-red-100 rounded-lg border-2 border-red-300 hover:bg-red-200">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-red-600" />
                  <span className="font-bold text-red-800">🇮🇱 Hebrew Landing</span>
                </div>
              </Link>
              <Link href="/ru" className="block p-4 bg-red-100 rounded-lg border-2 border-red-300 hover:bg-red-200">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-red-600" />
                  <span className="font-bold text-red-800">🇷🇺 Russian Landing</span>
                </div>
              </Link>
              <Link href="/pl" className="block p-4 bg-red-100 rounded-lg border-2 border-red-300 hover:bg-red-200">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-red-600" />
                  <span className="font-bold text-red-800">🇵🇱 Polish Landing</span>
                </div>
              </Link>
              <Link href="/landing" className="block p-4 bg-green-100 rounded-lg border-2 border-green-300 hover:bg-green-200">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-green-800">🇺🇸 English Landing</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Tools Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 px-2 border-b-2 border-gray-200 pb-2">TOOLS</h3>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded">Document Translator</div>
              <div className="p-3 bg-gray-50 rounded">FAQ</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}