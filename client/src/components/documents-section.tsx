import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Tag, Heart, CreditCard, Download, CheckCircle2 } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";

export default function DocumentsSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const polishDocuments = [
    {
      title: "Birth Certificates",
      description:
        "Polish birth certificates for all ancestors in the lineage, issued by Polish Civil Registry Offices after 1920.",
      icon: Tag,
      color: "bg-blue-600",
    },
    {
      title: "Marriage Certificates",
      description:
        "Polish marriage certificates for ancestors establishing family lineage and name changes.",
      icon: Heart,
      color: "bg-blue-600",
    },
    {
      title: "Residents and Voters Lists",
      description:
        "Historical residents lists and voters lists from Polish archives proving your ancestors' residence and citizenship status.",
      icon: CheckCircle2,
      color: "bg-blue-600",
    },
    {
      title: "Identity Documents",
      description:
        "Polish identity cards, military records, or other official Polish documents proving citizenship.",
      icon: CreditCard,
      color: "bg-blue-600",
    },
  ];

  const supportingDocs = [
    "Your Birth Certificate",
    "Parents' Birth Certificates", 
    "Marriage Certificates",
    "Certified Translations",
    "Apostille Certifications",
  ];

  return (
    <section id="documents" className="py-32 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <SectionTitle 
            first="Required"
            second="Documents"
          />
          <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Essential documentation needed for Polish citizenship confirmation.
            All documents must be Polish originals issued by Polish authorities.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h3 className="text-4xl font-bold text-black dark:text-white mb-8">
              Polish Documents Required
            </h3>
            <div className="space-y-8">
              {polishDocuments.map((doc, index) => {
                const Icon = doc.icon;
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
                        <Icon className="text-white w-8 h-8" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-xl font-bold text-black dark:text-white mb-3">
                          {doc.title}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{doc.description}</p>
                        
                        {/* Visual Description */}
                        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Visual Example:</div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {index === 0 && "Official Polish civil registry stamp, born after 1920, with clear family lineage information"}
                            {index === 1 && "Marriage certificate showing Polish union, with official seals and witness signatures"}
                            {index === 2 && "Historical archive documents with Polish residence records and voting eligibility proof"}
                            {index === 3 && "Polish government-issued identification with citizenship status clearly indicated"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Card className="mt-8 border-l-4 border-gray-400 bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <AlertTriangle className="text-gray-600 mr-3 mt-1 h-5 w-5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Important Notice
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Under the 2011 Polish Citizenship Act, applications without
                      original Polish documents will not be processed. We
                      specialize in obtaining these documents from Polish
                      archives.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Supporting Documentation
            </h3>
            <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-8">
                <div className="space-y-4">
                  {supportingDocs.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
                    >
                      <span className="text-gray-700 dark:text-gray-300">{doc}</span>
                      <CheckCircle2 className="text-blue-600 h-5 w-5" />
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <Button
                    onClick={() => scrollToSection("contact")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold rounded-xl"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Document Checklist
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
