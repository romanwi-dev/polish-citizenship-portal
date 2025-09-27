import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Gallery() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <a href="https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-red-800 hover:bg-red-900 text-white font-bold px-10 py-6 text-2xl md:text-3xl animated-button min-h-[70px]">
                TAKE POLISH CITIZENSHIP TEST
              </Button>
            </a>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PolishCitizenship.pl Gallery
          </h1>
          <p className="text-lg text-gray-600">
            Official images and branding from our Polish citizenship services
          </p>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Background Hero Images */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Hero Background Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Main Hero Background */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-64 bg-cover bg-center" 
                   style={{backgroundImage: "url('https://polishcitizenship.pl/wp-content/uploads/2016/01/fotolia_92433233.jpg')"}}>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Main Hero Image</h3>
                <p className="text-gray-600 text-sm">
                  European family representing Polish citizenship by descent - our primary hero background
                </p>
              </div>
            </div>

            {/* Secondary Hero */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-64 bg-cover bg-center" 
                   style={{backgroundImage: "url('https://polishcitizenship.pl/wp-content/uploads/2016/01/family.jpg')"}}>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Family Heritage Image</h3>
                <p className="text-gray-600 text-sm">
                  Three-generation Polish family showcasing ancestral heritage and citizenship legacy
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Logo Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Official Branding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Main Logo */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="mb-6">
                <img 
                  src="https://polishcitizenship.pl/wp-content/uploads/2016/01/polishcitizenship.pl-EMAIL-LOGO-kopia.png"
                  alt="PolishCitizenship.pl Official Logo"
                  className="max-h-32 mx-auto"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Primary Logo</h3>
              <p className="text-gray-600 text-sm">
                Official PolishCitizenship.pl logo for email communications and branding
              </p>
            </div>

            {/* Additional Logo Variant */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="mb-6 bg-gray-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-800">
                  PolishCitizenship.pl
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Premium Legal Services
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Text Logo Variant</h3>
              <p className="text-gray-600 text-sm">
                Clean text-based logo variation for various applications
              </p>
            </div>

          </div>
        </section>

        {/* Additional Assets */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Supporting Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Polish Heritage */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-red-600 to-white flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-3xl mb-2">🇵🇱</div>
                  <div className="font-bold">Polish Heritage</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">Polish Flag Theme</h3>
                <p className="text-gray-600 text-xs">National identity representation</p>
              </div>
            </div>

            {/* European Union */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-800 to-yellow-400 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-3xl mb-2">🇪🇺</div>
                  <div className="font-bold">EU Benefits</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">European Union Theme</h3>
                <p className="text-gray-600 text-xs">Citizenship benefits visualization</p>
              </div>
            </div>

            {/* Legal Services */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-3xl mb-2">⚖️</div>
                  <div className="font-bold">Legal Expertise</div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">Professional Services</h3>
                <p className="text-gray-600 text-xs">22+ years legal experience</p>
              </div>
            </div>

          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Brand Usage Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Standards</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• High-resolution images for professional presentation</li>
                <li>• Consistent color palette: Red (#DC2626) and Blue (#1E40AF)</li>
                <li>• Family heritage themes emphasizing multi-generational connections</li>
                <li>• European architectural backgrounds for authenticity</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo Applications</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Primary logo for official communications</li>
                <li>• Text variant for minimal space applications</li>
                <li>• Maintain clear space around logo elements</li>
                <li>• Use on appropriate background contrast</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}