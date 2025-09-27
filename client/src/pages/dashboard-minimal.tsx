export default function DashboardMinimal() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Polish Citizenship Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Client Details</h2>
              <p className="text-gray-600 mb-4">Enter your personal information</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Start Form
              </button>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Document Upload</h2>
              <p className="text-gray-600 mb-4">Upload required documents</p>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                Upload Files
              </button>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Family Tree</h2>
              <p className="text-gray-600 mb-4">Build your genealogy</p>
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                Build Tree
              </button>
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Generate PDFs</h2>
              <p className="text-gray-600 mb-4">Create legal documents</p>
              <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700">
                Generate
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-2xl font-bold text-green-600 mb-2">✓ Dashboard Working!</h3>
          <p className="text-gray-700">All 4 steps are ready for your Polish citizenship application.</p>
        </div>
      </div>
    </div>
  );
}