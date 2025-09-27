import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

// SEO and AI Search Optimization Component
function SEOOptimization() {
  useEffect(() => {
    // Add JSON-LD structured data for enhanced search visibility
    const addStructuredData = () => {
      // Organization Schema
      const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "LegalService",
        "name": "Polish Citizenship & Polish Passport Legal Services",
        "alternateName": "PolishCitizenship.pl",
        "url": "https://polishcitizenship.pl",
        "logo": "https://polishcitizenship.pl/logo.png",
        "description": "Professional legal services for Polish citizenship and Polish passport acquisition. Expert Polish citizenship by descent assistance, EU passport through Polish ancestry. 100% success rate with transparent pricing.",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "39.8283",
          "longitude": "-98.5795"
        },
        "areaServed": ["US", "GB", "CA", "AU", "IL", "IE", "NZ", "ZA"],
        "priceRange": "€2,999-€7,999",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "287",
          "bestRating": "5"
        }
      };

      // Service Schema with trending keywords
      const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Polish Citizenship by Descent Legal Services",
        "serviceType": "Legal Consultation",
        "provider": {
          "@type": "LegalService",
          "name": "Polish Citizenship Legal Experts",
          "knowsAbout": [
            "Polish citizenship",
            "Polish passport",
            "Polish citizenship by descent",
            "Polish passport application",
            "Polish citizenship by ancestry",
            "Polish citizenship confirmation",
            "Polish passport by descent",
            "Polish passport requirements",
            "EU citizenship through Polish ancestry",
            "Polish citizenship Jewish ancestry",
            "Polish passport cost",
            "Polish citizenship 1920 cutoff",
            "Polish citizenship unbroken lineage",
            "Voivode application Poland",
            "Polish passport processing time",
            "Polish citizenship documents required"
          ]
        },
        "areaServed": [
          "United States",
          "United Kingdom", 
          "Canada",
          "Australia",
          "Israel",
          "Ireland",
          "New Zealand",
          "South Africa"
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Polish Citizenship Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Standard Polish Citizenship Service",
                "description": "Complete legal assistance for Polish citizenship by descent with 12-24 month timeline. Includes document research, translation, and voivode application."
              },
              "price": "2999",
              "priceCurrency": "USD"
            },
            {
              "@type": "Offer", 
              "itemOffered": {
                "@type": "Service",
                "name": "Premium Polish Citizenship Service",
                "description": "Priority processing for Polish citizenship confirmation with dedicated case manager and expedited document procurement."
              },
              "price": "4999",
              "priceCurrency": "USD"
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service", 
                "name": "Express Polish Citizenship Service",
                "description": "White glove Polish citizenship service with fastest processing, VIP support, and comprehensive genealogy research."
              },
              "price": "7999",
              "priceCurrency": "USD"
            }
          ]
        }
      };

      // FAQ Schema for rich snippets
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I get Polish citizenship?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can get Polish citizenship through descent if you have Polish ancestors who maintained citizenship. The process involves proving unbroken lineage, gathering documents, and submitting an application to the Polish government. We provide complete legal assistance for this process."
            }
          },
          {
            "@type": "Question",
            "name": "How to get a Polish passport?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "To get a Polish passport, you first need to confirm Polish citizenship through descent or naturalization. Once citizenship is confirmed, you can apply for a Polish passport at any Polish consulate. The passport application takes 3-8 weeks after citizenship confirmation."
            }
          },
          {
            "@type": "Question",
            "name": "How much does Polish citizenship and passport cost?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our Polish citizenship services range from $2,999 (Standard) to $7,999 (Express). Government fees are €58 for citizenship confirmation and €140 for Polish passport. Total costs include document procurement, translations, and legal representation."
            }
          },
          {
            "@type": "Question",
            "name": "What is the Polish citizenship and passport processing time in 2025?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Polish citizenship confirmation takes 12-24 months at the Masovian Voivode office. Polish passport issuance takes an additional 3-8 weeks after citizenship is confirmed. Our Express service can expedite the overall timeline."
            }
          },
          {
            "@type": "Question",
            "name": "Can I get Polish citizenship through Jewish ancestry?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, many Jewish families who emigrated from Poland before 1920 qualify. We specialize in Jewish ancestry cases with access to Ukrainian and Polish archives."
            }
          },
          {
            "@type": "Question",
            "name": "What documents are required for Polish citizenship by descent?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Required documents include birth certificates, marriage certificates, Polish passports or military records of ancestors, and proof of unbroken lineage. We help locate missing documents."
            }
          }
        ]
      };

      // Add all schemas to head
      const schemas = [organizationSchema, serviceSchema, faqSchema];
      schemas.forEach(schema => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    };

    addStructuredData();

    // Enhanced meta tags for AI search and SEO
    const updateMetaForAI = () => {
      // Add or update meta tags for better AI understanding
      const metaTags = [
        { name: "description", content: "Polish citizenship and Polish passport legal services with 100% success rate. Expert Polish citizenship by descent assistance for Americans, British, Canadians. Get your Polish passport through ancestry. 12-24 month processing. $2,999-$7,999." },
        { name: "keywords", content: "Polish citizenship, Polish passport, Polish citizenship by descent, Polish passport application, Polish citizenship by ancestry, Polish citizenship confirmation, Polish passport by descent, Polish passport requirements, EU citizenship through Polish ancestry, Polish citizenship Jewish ancestry, Polish passport cost, Polish citizenship documents required, Polish citizenship 1920 cutoff, Voivode application Poland, Polish passport processing time, Polish citizenship unbroken lineage, Polish citizenship processing time 2025, Polish citizenship cost 2025, Polish citizenship British citizens, Polish citizenship for Americans, Polish passport for Americans" },
        { name: "AI-description", content: "Professional Polish citizenship and Polish passport lawyers helping diaspora families reclaim EU citizenship. Expert Polish citizenship by descent services. Specializing in Jewish ancestry cases, pre-1920 emigration, and complex genealogy research. Get your Polish passport in 12-24 months with transparent pricing $2,999-$7,999." },
        { name: "voice-search-keywords", content: "how to get polish citizenship, how to get polish passport, polish citizenship by descent, polish passport application process, polish citizenship requirements for americans, polish citizenship cost and timeline, polish citizenship lawyer near me, polish passport through grandparents, polish citizenship jewish ancestry, polish passport processing time 2025" },
        { name: "chatgpt-optimized", content: "Polish citizenship expert legal services, Polish passport acquisition, Polish citizenship by descent, EU passport through Polish ancestry, document research, archive searches, voivode applications, jus sanguinis citizenship, dual nationality, Polish citizenship confirmation, Polish passport application, Ukrainian archives Polish documents" },
        { name: "semantic-keywords", content: "Polish citizenship confirmation, Polish passport eligibility, Polish ancestry citizenship, European Union passport rights, Polish Jewish heritage citizenship, Polish citizenship great grandparent eligibility, Polish citizenship 1920 law requirements, Polish passport through ancestry, Polish citizenship lost citizenship recovery, Polish citizenship constitutional protection, Polish passport for diaspora" }
      ];

      metaTags.forEach(tag => {
        const existingTag = document.querySelector(`meta[name="${tag.name}"]`);
        if (existingTag) {
          existingTag.setAttribute('content', tag.content);
        } else {
          const newTag = document.createElement('meta');
          newTag.name = tag.name;
          newTag.content = tag.content;
          document.head.appendChild(newTag);
        }
      });
    };

    updateMetaForAI();

    // Add breadcrumb schema for better navigation understanding
    const addBreadcrumbSchema = () => {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://polishcitizenship.pl"
          },
          {
            "@type": "ListItem", 
            "position": 2,
            "name": "Polish Citizenship Services",
            "item": "https://polishcitizenship.pl#services"
          },
          {
            "@type": "ListItem",
            "position": 3, 
            "name": "Eligibility Assessment",
            "item": "https://polishcitizenship.pl/citizenship-test"
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "FAQ",
            "item": "https://polishcitizenship.pl/faq"
          }
        ]
      };

      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.text = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(breadcrumbScript);
    };

    addBreadcrumbSchema();

  }, []);

  return null; // This component only adds SEO data, no visual output
}

// Enhanced keyword optimization for different page types
export const getPageSEO = (pageType: string) => {
  const seoData = {
    home: {
      title: "Polish Citizenship & Polish Passport 2025 | Expert Legal Services | 100% Success Rate",
      description: "Professional Polish citizenship and Polish passport lawyers helping Americans, UK, Canadians obtain EU passports through Polish ancestry. Expert Polish citizenship by descent services. 20+ years experience, transparent pricing $2,999-$7,999. Free assessment.",
      keywords: "polish citizenship, polish passport, polish citizenship by descent, polish passport application, polish citizenship confirmation, polish passport by descent, polish citizenship Americans, polish citizenship UK, polish passport for Americans, eu passport, polish ancestry citizenship",
      h1: "Polish Citizenship & Polish Passport - Expert Legal Guidance for EU Citizenship",
      schema: "LegalService"
    },
    assessment: {
      title: "Free Polish Citizenship Eligibility Assessment | 10-Minute Test | Expert Analysis",
      description: "Take our comprehensive Polish citizenship by descent eligibility test. AI-powered analysis based on 20+ years of case data. Immediate preliminary results, expert review within 48 hours.",
      keywords: "polish citizenship eligibility test, polish citizenship requirements, polish citizenship assessment, polish ancestry eligibility, polish citizenship great grandparent",
      h1: "Polish Citizenship Eligibility Assessment - Free 10-Minute Test",
      schema: "WebApplication"
    },
    faq: {
      title: "Polish Citizenship by Descent FAQ 2025 | Expert Answers | Complete Guide",
      description: "Comprehensive FAQ about Polish citizenship by descent process. Expert answers on eligibility, costs, timelines, documents. Based on 5,000+ successful cases and 22 years experience.",
      keywords: "polish citizenship faq, polish citizenship questions, polish citizenship by descent requirements, polish citizenship process, polish citizenship documents needed",
      h1: "Polish Citizenship by Descent FAQ - Expert Answers to Common Questions",
      schema: "FAQPage"
    },
    testimonials: {
      title: "Polish Citizenship Success Stories | 5,000+ Happy Clients | Real Results",
      description: "Read real success stories from Americans, British, Canadians who obtained Polish citizenship by descent. 100% success rate, authentic testimonials, verified results.",
      keywords: "polish citizenship success stories, polish citizenship testimonials, polish citizenship results, polish citizenship reviews, eu passport success",
      h1: "Polish Citizenship Success Stories - Real Results from Happy Clients",
      schema: "Review"
    }
  };

  return seoData[pageType as keyof typeof seoData] || seoData.home;
};

export default SEOOptimization;