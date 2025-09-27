import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Tag, Heart, CreditCard, Download, CheckCircle2 } from "lucide-react";

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
      color: "bg-primary-blue",
    },
    {
      title: "Marriage Certificates",
      description:
        "Polish marriage certificates for ancestors establishing family lineage and name changes.",
      icon: Heart,
      color: "bg-primary-blue",
    },
    {
      title: "Residents and Voters Lists",
      description:
        "Historical residents lists and voters lists from Polish archives proving your ancestors' residence and citizenship status.",
      icon: CheckCircle2,
      color: "bg-primary-blue",
    },
    {
      title: "Identity Documents",
      description:
        "Polish identity cards, military records, or other official Polish documents proving citizenship.",
      icon: CreditCard,
      color: "bg-primary-blue",
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
    <section id="documents" className="py-32 bg-very-light-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            <span className="block text-neutral-warm">Required</span>
            <span className="block text-primary-blue">Documents</span>
          </h2>
          <p className="text-2xl font-semibold text-neutral-cool max-w-3xl mx-auto">
            Essential documentation needed for Polish citizenship confirmation.
            All documents must be Polish originals issued by Polish authorities.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h3 className="text-2xl font-bold text-neutral-warm mb-6">
              Polish Documents Required
            </h3>
            <div className="space-y-6">
              {polishDocuments.map((doc, index) => {
                const Icon = doc.icon;
                return (
                  <div key={index} className="flex items-start">
                    <div
                      className={`w-8 h-8 ${doc.color} rounded-full flex items-center justify-center mr-4 mt-1`}
                    >
                      <Icon className="text-white w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-warm mb-2">
                        {doc.title}
                      </h4>
                      <p className="text-neutral-cool text-sm">{doc.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Card className="mt-8 border-l-4 border-medium-gray bg-surface-elevated">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <AlertTriangle className="text-medium-gray mr-3 mt-1 h-5 w-5" />
                  <div>
                    <h4 className="font-semibold text-neutral-warm mb-2">
                      Important Notice
                    </h4>
                    <p className="text-sm text-neutral-cool">
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
            <h3 className="text-2xl font-bold text-neutral-warm mb-6">
              Supporting Documentation
            </h3>
            <Card className="bg-surface-elevated border border-gray-100">
              <CardContent className="p-8">
                <div className="space-y-4">
                  {supportingDocs.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
                    >
                      <span className="text-neutral-cool">{doc}</span>
                      <CheckCircle2 className="text-primary-blue h-5 w-5" />
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <Button
                    onClick={() => scrollToSection("contact")}
                    className="bg-primary-blue hover:bg-primary-blue-light text-white px-6 py-3 font-semibold rounded-xl"
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
