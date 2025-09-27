import { useEffect } from "react";

// Location-specific SEO optimization for different markets
export default function LocationSpecificSEO() {
  useEffect(() => {
    // Detect user location and add relevant schema
    const addLocationSchema = async () => {
      try {
        // Simple geo detection based on timezone or other indicators
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let location = 'international';
        
        if (timeZone.includes('America/')) location = 'usa';
        else if (timeZone.includes('Europe/London')) location = 'uk';
        else if (timeZone.includes('America/Toronto')) location = 'canada';
        else if (timeZone.includes('Australia/')) location = 'australia';

        // Add location-specific schema
        const locationSchemas: Record<string, any> = {
          usa: {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Polish Citizenship Services for Americans",
            "description": "Specialized Polish citizenship by descent services for Americans with Polish ancestry. Helping 10+ million Polish-Americans obtain EU passports while keeping US citizenship.",
            "areaServed": {
              "@type": "Country",
              "name": "United States"
            },
            "knowsAbout": [
              "US-Poland dual citizenship laws",
              "American Polish ancestry documentation",
              "USCIS compatibility with Polish citizenship",
              "American Polish community services"
            ]
          },
          uk: {
            "@context": "https://schema.org", 
            "@type": "LocalBusiness",
            "name": "Polish Citizenship Services for British Citizens",
            "description": "Post-Brexit Polish citizenship by descent services for British citizens. Regain EU rights through Polish ancestry while maintaining British citizenship.",
            "areaServed": {
              "@type": "Country", 
              "name": "United Kingdom"
            },
            "knowsAbout": [
              "Post-Brexit EU citizenship options",
              "UK-Poland dual citizenship laws",
              "British Polish ancestry research",
              "EU rights restoration through Polish heritage"
            ]
          },
          canada: {
            "@context": "https://schema.org",
            "@type": "LocalBusiness", 
            "name": "Polish Citizenship Services for Canadians",
            "description": "Polish citizenship by descent services for Canadians with Polish heritage. Canada recognizes dual citizenship with Poland for full EU benefits.",
            "areaServed": {
              "@type": "Country",
              "name": "Canada" 
            },
            "knowsAbout": [
              "Canada-Poland dual citizenship laws",
              "Canadian Polish ancestry documentation", 
              "Quebec Polish heritage services",
              "Canadian Polish community support"
            ]
          }
        };

        if (locationSchemas[location]) {
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.text = JSON.stringify(locationSchemas[location]);
          document.head.appendChild(script);
        }

      } catch (error) {
        console.log('Location detection skipped');
      }
    };

    addLocationSchema();

    // Add location-specific meta tags
    const addLocationMeta = () => {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let locationKeywords = '';
      
      if (timeZone.includes('America/New_York') || timeZone.includes('America/Chicago')) {
        locationKeywords = 'polish citizenship americans, us polish dual citizenship, american polish ancestry, polish citizenship usa';
      } else if (timeZone.includes('Europe/London')) {
        locationKeywords = 'polish citizenship uk, british polish citizenship, brexit polish citizenship, polish citizenship britain';
      } else if (timeZone.includes('America/Toronto')) {
        locationKeywords = 'polish citizenship canada, canadian polish citizenship, dual citizenship canada poland';
      }

      if (locationKeywords) {
        const existingMeta = document.querySelector('meta[name="geo-keywords"]');
        if (existingMeta) {
          existingMeta.setAttribute('content', locationKeywords);
        } else {
          const metaTag = document.createElement('meta');
          metaTag.name = 'geo-keywords';
          metaTag.content = locationKeywords;
          document.head.appendChild(metaTag);
        }
      }
    };

    addLocationMeta();
  }, []);

  return null;
}