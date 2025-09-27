import { memo } from "react";

import DocumentChecklist from "@/components/document-checklist";
import DocumentVerificationRings from "@/components/document-verification-rings";

import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const DocumentProgress = memo(function DocumentProgress() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:text-blue-200 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Document Management Center
          </h1>
          <p className="text-xl text-blue-100">
            Track your document collection and verification progress in real-time
          </p>
        </div>
      </section>

      {/* Document Progress Overview */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Document Progress Overview
          </h2>
          <div id="document-checklist">
            <DocumentChecklist />
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="border-t border-gray-200 my-8"></div>

      {/* Document Verification Progress */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Animated Document Verification Progress
          </h2>
          <div id="document-verification">
            <DocumentVerificationRings />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Help with Your Documents?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Our team of experts is ready to assist you with document collection and verification
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contact">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                Contact Our Experts
              </Button>
            </Link>
            <Link href="/#documents">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                View Required Documents
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
});

export default DocumentProgress;