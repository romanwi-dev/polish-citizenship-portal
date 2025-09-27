import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function LegalDisclaimer() {
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
            <h1 className="text-3xl font-bold mb-6">Legal Disclaimer</h1>
            <div className="space-y-4 text-gray-600">
              
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">Legal Services Disclaimer</h2>
                <p>PolishCitizenship.pl provides professional legal services related to Polish citizenship confirmation and European passport applications. Our services include legal consultation, document preparation, and case management.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">No Guarantee of Results</h2>
                <p>While we employ experienced legal professionals and maintain a high success rate, we cannot guarantee the outcome of any citizenship application. Final decisions rest solely with Polish governmental authorities.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">Information Accuracy</h2>
                <p>We strive to maintain accurate and up-to-date information on our website. However, Polish citizenship laws and procedures may change. Always consult with our legal team for the most current information relevant to your case.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">Processing Times</h2>
                <p>Processing times mentioned on our website are estimates based on historical data and current government timelines. Actual processing times may vary depending on case complexity, government workload, and other factors beyond our control.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">Third-Party Services</h2>
                <p>We may work with third-party services including translation agencies, document procurement services, and government offices. We are not responsible for delays or issues caused by third-party providers.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">Limitation of Liability</h2>
                <p>Our liability is limited to the fees paid for our services. We are not liable for indirect, consequential, or incidental damages arising from the use of our services or inability to obtain Polish citizenship.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">Professional Advice</h2>
                <p>Information on this website is for general informational purposes and should not be considered as legal advice for specific situations. Each case is unique and requires individual consultation.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>
                <p>For specific legal advice regarding your citizenship case, please schedule a consultation through our website or contact us at: info@polishcitizenship.pl</p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}