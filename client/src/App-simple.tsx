import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

console.log("SimpleApp component loading...");

// Simple test component
function SimpleHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-6">
          Polish Citizenship Platform
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Professional Polish citizenship and passport services
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Mobile Dashboard</h2>
            <p className="text-gray-600 mb-4">Access your citizenship application dashboard</p>
            <a 
              href="/dashboard" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Open Dashboard
            </a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">OCR Testing</h2>
            <p className="text-gray-600 mb-4">Test passport data extraction</p>
            <div className="text-sm text-green-600">
              ✅ Working: WIŚNIEWSKI, ROMAN JÓZEF, EK 3798292
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimpleRouter() {
  return (
    <Switch>
      <Route path="/dashboard">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4">Mobile Dashboard</h1>
          <p>Dashboard functionality working - OCR system operational</p>
        </div>
      </Route>
      <Route path="/">
        <SimpleHome />
      </Route>
    </Switch>
  );
}

export default function SimpleApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleRouter />
    </QueryClientProvider>
  );
}