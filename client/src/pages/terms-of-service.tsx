import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/">
          <div className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </div>
        </Link>

        <Card>
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <div className="space-y-4 text-gray-600">
              <p className="text-sm text-gray-500">Effective Date: January 2025</p>
              
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">1. Service Agreement</h2>
                <p>By using our services, you agree to these terms. We provide professional legal assistance for Polish citizenship confirmation and European passport applications.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">2. Eligibility</h2>
                <p>Our services are available to individuals with Polish ancestry seeking to confirm their citizenship rights. You must provide accurate and complete information.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">3. Service Fees</h2>
                <p>Service fees are outlined in your consultation agreement. Payment terms and refund policies are specified in individual service contracts.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">4. Client Responsibilities</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>Provide accurate and complete information</li>
                  <li>Submit required documents in a timely manner</li>
                  <li>Respond to communications promptly</li>
                  <li>Pay agreed-upon fees according to schedule</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">5. Service Limitations</h2>
                <p>While we strive for successful outcomes, we cannot guarantee citizenship confirmation as decisions rest with Polish authorities. Processing times are estimates based on current government timelines.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">6. Intellectual Property</h2>
                <p>All content, materials, and resources provided remain our intellectual property. Clients receive a license to use materials solely for their citizenship application.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">7. Governing Law</h2>
                <p>These terms are governed by Polish and European Union law. Any disputes will be resolved through arbitration in Warsaw, Poland.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">8. Contact</h2>
                <p>For questions about these terms, contact us at: legal@polishcitizenship.pl</p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}