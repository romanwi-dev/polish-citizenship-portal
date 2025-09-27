// SEO Optimizer for 100/100 Score
import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEOOptimizer = ({ 
  title, 
  description, 
  keywords = 'Polish citizenship, Polish passport, EU citizenship by descent, Polish citizenship by descent, Polish citizenship application, Polish passport application, citizenship Poland, Polish ancestry citizenship, Polish citizenship lawyer, Polish citizenship service',
  image = '/og-image.png',
  url = 'https://polishcitizenship.pl',
  type = 'website'
}: SEOProps) => {
  const fullTitle = `${title} | Polish Citizenship & Passport Services`;
  
  // Comprehensive structured data for maximum SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LegalService",
        "@id": `${url}#organization`,
        "name": "Polish Citizenship Legal Services",
        "description": "Expert legal services for Polish citizenship by descent and Polish passport applications",
        "url": url,
        "logo": `${url}/logo.png`,
        "image": image,
        "priceRange": "$$",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "127"
        },
        "areaServed": {
          "@type": "Place",
          "name": "Worldwide"
        },
        "serviceType": [
          "Polish Citizenship Application",
          "Polish Passport Services",
          "EU Citizenship by Descent",
          "Legal Document Translation",
          "Genealogical Research"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        "url": url,
        "name": "Polish Citizenship Services",
        "description": description,
        "publisher": {
          "@id": `${url}#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${url}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        "url": url,
        "name": fullTitle,
        "description": description,
        "isPartOf": {
          "@id": `${url}#website`
        },
        "about": {
          "@type": "Thing",
          "name": "Polish Citizenship by Descent"
        },
        "primaryImageOfPage": {
          "@type": "ImageObject",
          "url": image
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How long does Polish citizenship application take?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The Polish citizenship application process typically takes 12-18 months, depending on document availability and government processing times."
            }
          },
          {
            "@type": "Question",
            "name": "Who qualifies for Polish citizenship by descent?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You may qualify if you have Polish ancestors who were born in Poland or its historical territories and did not lose citizenship before passing it to descendants."
            }
          },
          {
            "@type": "Question",
            "name": "What documents are needed for Polish citizenship?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Required documents include birth certificates, marriage certificates, Polish passports or ID cards of ancestors, and proof of Polish military service or residence."
            }
          }
        ]
      }
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Polish Citizenship Legal Services" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={url} />
      
      {/* Language and Locale */}
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="pl_PL" />
      <link rel="alternate" hrefLang="en" href={url} />
      <link rel="alternate" hrefLang="pl" href={`${url}/pl`} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Polish Citizenship Services" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta name="theme-color" content="#1e40af" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEOOptimizer;