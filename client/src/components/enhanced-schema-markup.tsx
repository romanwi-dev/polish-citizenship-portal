import { useEffect } from "react";

/**
 * Enhanced Schema Markup Component
 * Adds additional schema types for better SEO and rich snippets
 */
export default function EnhancedSchemaMarkup() {
  useEffect(() => {
    // Remove existing enhanced schemas to prevent duplicates
    document.querySelectorAll('script[data-schema="enhanced"]').forEach(el => el.remove());

    // 1. BreadcrumbList Schema for better navigation understanding
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://polishcitizenship.pl/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Polish Citizenship Services",
          "item": "https://polishcitizenship.pl/polish-citizenship"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Eligibility Assessment",
          "item": "https://polishcitizenship.pl/eligibility-test"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Client Dashboard",
          "item": "https://polishcitizenship.pl/dashboard"
        }
      ]
    };

    // 2. HowTo Schema for step-by-step process
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Get Polish Citizenship by Descent",
      "description": "Complete step-by-step guide to obtaining Polish citizenship through ancestry with professional legal assistance.",
      "image": "https://polishcitizenship.pl/images/polish-citizenship-process.jpg",
      "totalTime": "PT24M",
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": "EUR",
        "value": "3500-12500"
      },
      "supply": [
        {
          "@type": "HowToSupply",
          "name": "Birth Certificates (Multiple Generations)"
        },
        {
          "@type": "HowToSupply", 
          "name": "Marriage Certificates"
        },
        {
          "@type": "HowToSupply",
          "name": "Polish Military or Civil Records"
        },
        {
          "@type": "HowToSupply",
          "name": "Legal Representation"
        }
      ],
      "tool": [
        {
          "@type": "HowToTool",
          "name": "Professional Legal Services"
        },
        {
          "@type": "HowToTool",
          "name": "Archive Research Access"
        },
        {
          "@type": "HowToTool",
          "name": "Document Translation Services"
        }
      ],
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Initial Eligibility Assessment",
          "text": "Complete comprehensive eligibility evaluation to determine if you qualify for Polish citizenship by descent based on your family history.",
          "image": "https://polishcitizenship.pl/images/step-1-assessment.jpg",
          "url": "https://polishcitizenship.pl/eligibility-test"
        },
        {
          "@type": "HowToStep", 
          "position": 2,
          "name": "Document Research and Procurement",
          "text": "Professional research team locates and obtains required Polish civil records, military documents, and vital records from Polish and Ukrainian archives.",
          "image": "https://polishcitizenship.pl/images/step-2-documents.jpg",
          "url": "https://polishcitizenship.pl/documents-required"
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "Legal Application Preparation",
          "text": "Expert legal team prepares comprehensive citizenship application with all supporting documentation, translations, and legal arguments.",
          "image": "https://polishcitizenship.pl/images/step-3-application.jpg",
          "url": "https://polishcitizenship.pl/procedure-guide"
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "name": "Government Submission and Processing",
          "text": "Submit complete application to Polish Masovian Voivode office and monitor processing status throughout 12-48 month government review period.",
          "image": "https://polishcitizenship.pl/images/step-4-processing.jpg",
          "url": "https://polishcitizenship.pl/dashboard"
        },
        {
          "@type": "HowToStep",
          "position": 5,
          "name": "Citizenship Confirmation and Passport Application",
          "text": "Upon citizenship confirmation, apply for Polish passport at Polish consulate to receive your EU passport and complete the process.",
          "image": "https://polishcitizenship.pl/images/step-5-passport.jpg",
          "url": "https://polishcitizenship.pl/polish-passport"
        }
      ]
    };

    // 3. VideoObject Schema for testimonial videos
    const videoSchema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": "Polish Citizenship Success Stories - Client Testimonials",
      "description": "Real client testimonials sharing their successful Polish citizenship by descent journey with our legal services.",
      "thumbnailUrl": "https://polishcitizenship.pl/images/testimonial-video-thumbnail.jpg",
      "uploadDate": "2025-08-15",
      "duration": "PT3M45S",
      "contentUrl": "https://polishcitizenship.pl/videos/client-testimonials.mp4",
      "embedUrl": "https://polishcitizenship.pl/embed/testimonials",
      "publisher": {
        "@type": "Organization",
        "name": "Polish Citizenship Legal Services",
        "logo": {
          "@type": "ImageObject",
          "url": "https://polishcitizenship.pl/images/logo.png"
        }
      },
      "interactionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/WatchAction",
        "userInteractionCount": 15847
      }
    };

    // 4. Course Schema for educational content
    const courseSchema = {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "Understanding Polish Citizenship by Descent Requirements",
      "description": "Comprehensive educational course covering Polish citizenship law, eligibility requirements, and application processes for citizenship by descent.",
      "provider": {
        "@type": "Organization",
        "name": "Polish Citizenship Legal Experts",
        "url": "https://polishcitizenship.pl"
      },
      "courseCode": "PCD-101",
      "educationalLevel": "Beginner",
      "teaches": [
        "Polish citizenship law fundamentals",
        "1920 independence date significance", 
        "Unbroken lineage requirements",
        "Document requirements and research",
        "Application process and timeline",
        "Common eligibility issues and solutions"
      ],
      "timeRequired": "PT2H30M",
      "coursePrerequisites": "Basic understanding of family genealogy",
      "inLanguage": "en",
      "isAccessibleForFree": true,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "category": "Free Educational Content"
      }
    };

    // 5. Event Schema for consultations and webinars
    const eventSchema = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": "Free Polish Citizenship Eligibility Consultation",
      "description": "Complimentary 30-minute consultation with Polish citizenship legal experts to assess your eligibility for citizenship by descent.",
      "startDate": "2025-08-16T10:00:00+01:00",
      "endDate": "2025-08-16T10:30:00+01:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
      "location": {
        "@type": "VirtualLocation",
        "url": "https://polishcitizenship.pl/consultation"
      },
      "organizer": {
        "@type": "Organization",
        "name": "Polish Citizenship Legal Services",
        "url": "https://polishcitizenship.pl"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://polishcitizenship.pl/contact"
      },
      "performer": {
        "@type": "Person",
        "name": "Polish Citizenship Legal Expert"
      }
    };

    // 6. WebPage Schema for specific pages
    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Polish Citizenship & Polish Passport Legal Services",
      "description": "Professional legal services for Polish citizenship and Polish passport acquisition through ancestry. Expert Polish citizenship by descent assistance.",
      "url": "https://polishcitizenship.pl",
      "inLanguage": "en",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Polish Citizenship Legal Services",
        "url": "https://polishcitizenship.pl"
      },
      "breadcrumb": {
        "@id": "#breadcrumb"
      },
      "mainEntity": {
        "@type": "LegalService",
        "@id": "https://polishcitizenship.pl/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://polishcitizenship.pl/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    };

    // Function to add schema to page
    const addSchema = (schema: any, id: string) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema', 'enhanced');
      script.setAttribute('data-schema-id', id);
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    };

    // Add all enhanced schemas
    addSchema(breadcrumbSchema, 'breadcrumb');
    addSchema(howToSchema, 'howto');
    addSchema(videoSchema, 'video');
    addSchema(courseSchema, 'course'); 
    addSchema(eventSchema, 'event');
    addSchema(webPageSchema, 'webpage');

    // Cleanup function
    return () => {
      document.querySelectorAll('script[data-schema="enhanced"]').forEach(el => el.remove());
    };
  }, []);

  return null; // This component only adds schema markup, no visual output
}

// Export for use in main app
export { EnhancedSchemaMarkup };