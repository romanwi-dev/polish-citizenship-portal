import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
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
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <div className="space-y-4 text-gray-600">
              <p className="text-sm text-gray-500">Last updated: January 2025</p>
              
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">1. Information We Collect</h2>
                <p>We collect personal information you provide directly to us, including name, email address, phone number, and citizenship-related documentation necessary for your application.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">2. How We Use Your Information</h2>
                <p>We use your information to process your Polish citizenship application, communicate with you about your case, and comply with legal obligations.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">3. Data Security</h2>
                <p>We implement bank-level security measures including SSL encryption, secure data storage, and strict access controls to protect your sensitive information.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">4. GDPR Compliance</h2>
                <p>We comply with all GDPR requirements. You have the right to access, modify, or delete your personal data. Contact us to exercise these rights.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">5. Data Retention</h2>
                <p>We retain your data for the duration necessary to complete your citizenship application and comply with legal requirements, typically 7 years after case completion.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">6. Contact Information</h2>
                <p>For privacy-related questions, contact our Data Protection Officer at: privacy@polishcitizenship.pl</p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}