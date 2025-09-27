import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';



export default function DashboardSimple() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">
            Polish Citizenship Dashboard
          </h1>
          <p className="text-gray-600">Your citizenship application workflow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          
          {/* Step 1: Client Details */}
          <Card className="bg-white border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Client Details</h3>
              <p className="text-gray-600 mb-4">Enter your personal information</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Start Form
              </Button>
            </CardContent>
          </Card>

          {/* Step 2: Document Upload */}
          <Card className="bg-white border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Document Upload</h3>
              <p className="text-gray-600 mb-4">Upload required documents</p>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Upload Files
              </Button>
            </CardContent>
          </Card>

          {/* Step 3: Family Tree */}
          <Card className="bg-white border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Family Tree</h3>
              <p className="text-gray-600 mb-4">Build your genealogy</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Build Tree
              </Button>
            </CardContent>
          </Card>

          {/* Step 4: Generate Documents */}
          <Card className="bg-white border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Generate PDFs</h3>
              <p className="text-gray-600 mb-4">Create legal documents</p>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                Generate
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard is Working!</h2>
              <p className="text-gray-700 mb-6">
                All 4 sections are now accessible. Complete each step in order to prepare your Polish citizenship application.
              </p>
              <div className="flex justify-center space-x-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Start Application
                </Button>
                <Button size="lg" variant="outline">
                  View Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      

    </div>
  );
}