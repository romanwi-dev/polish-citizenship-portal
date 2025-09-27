import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  FileText, 
  Award, 
  ArrowRight,
  Shield,
  Globe,
  Star
} from "lucide-react";
import { Link } from "wouter";
import { ThemeSwitcher } from "@/components/theme-switcher";

function LandingPageSpanish() {
  return (
    <>
      <ThemeSwitcher />
      <Helmet>
        <title>Ciudadanía Polaca por Descendencia | Servicios Legales Expertos | Pasaporte UE</title>
        <meta name="description" content="Servicios legales profesionales para ciudadanía polaca por descendencia. 100% tasa de éxito verdadero, cronograma realista de 1.5-4 años, precios transparentes desde €3,500. Orientación experta para solicitudes de pasaporte UE." />
        <meta name="keywords" content="ciudadanía polaca por descendencia, pasaporte UE, ascendencia polaca, ciudadanía europea, test ciudadanía polaca, genealogía polaca, ciudadanía UE por descendencia" />
        <link rel="canonical" href="https://polishcitizenship.pl/landing-spanish" />
        
        {/* Critical Google PageSpeed 100 optimizations like latitudeworld.com */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//polishcitizenship.pl" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Geo-targeting for Spanish speakers */}
        <meta name="geo.region" content="ES" />
        <meta name="geo.country" content="Spain" />
        <meta name="geo.placename" content="Spain" />
        <meta name="ICBM" content="40.4637, -3.7492" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Ciudadanía Polaca por Descendencia | Verificación Rápida de Elegibilidad para Pasaporte UE" />
        <meta property="og:description" content="Verifique su elegibilidad para la ciudadanía polaca por descendencia en minutos. Obtenga su pasaporte de la Unión Europea a través de la ascendencia polaca." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://polishcitizenship.pl/landing-spanish" />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Servicios de Ciudadanía Polaca por Descendencia",
            "description": "Asistencia legal para ciudadanía polaca por descendencia y adquisición de pasaporte UE",
            "provider": {
              "@type": "Organization",
              "name": "Servicios de Ciudadanía Polaca",
              "url": "https://polishcitizenship.pl"
            },
            "areaServed": "Mundial",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Servicios de Ciudadanía Polaca",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Evaluación de Elegibilidad para Ciudadanía Polaca"
                  }
                }
              ]
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section - Above the Fold */}
        <section className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 pt-4 pb-8 sm:py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            
            {/* Centered Title Section */}
            <div className="text-center mb-12">
              <Badge className="bg-red-100 text-red-800 mb-6 sm:mb-8 px-4 py-2">
                🇵🇱 Pasaporte UE a través de Ascendencia Polaca 🇪🇺
              </Badge>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8" style={{
                fontSize: 'clamp(3rem, 8vw, 6rem)',
                letterSpacing: '-0.02em',
                lineHeight: '1.1'
              }}>
                <span className="text-gray-900 dark:text-white">Obtenga Su</span>
                <br />
                <span className="text-blue-800 dark:text-blue-400">Ciudadanía Polaca</span>
                <br />
                <span className="text-gray-900 dark:text-white">por Descendencia</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 leading-relaxed max-w-4xl mx-auto" style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                letterSpacing: '-0.01em',
                lineHeight: '1.5'
              }}>
                Verifique su elegibilidad para la ciudadanía polaca y el pasaporte de la Unión Europea en menos de 3 minutos con análisis IA. 
                Orientación legal profesional con 100% tasa de éxito verdadero.
              </p>
            </div>

            {/* CTA Buttons - Centered */}
            <div className="flex flex-col lg:flex-row justify-center gap-6 mb-12">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-8 text-lg font-semibold border border-white rounded-sm shadow-none cursor-pointer max-w-md"
                onClick={() => {
                  window.location.href = '/#top';
                }}
              >
                Visite Nuestro Portal de Ciudadanía Polaca
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-8 text-lg font-semibold border border-white rounded-sm shadow-none cursor-pointer transition-all duration-200 transform hover:scale-105 max-w-md"
                onClick={() => {
                  window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
                }}
              >
                Realizar Examen Completo de Ciudadanía Polaca
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Trust Indicators - Centered */}
            <div className="flex flex-wrap justify-center gap-8 mb-12 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Verificación de elegibilidad gratuita
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                Evaluación de 15 minutos
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-purple-500 mr-2" />
                5,000+ casos exitosos
              </div>
            </div>
              
            {/* Benefits Card - Below CTAs */}
            <div className="flex justify-center">
              <Card className="bg-white dark:bg-gray-800 shadow-2xl border-0 max-w-2xl w-full">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Beneficios del Pasaporte UE
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">Desbloquee oportunidades europeas</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Viva y trabaje en 27 países de la UE</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Acceso gratuito a atención médica y educación</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Viajes sin visa a más de 180 países</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Oportunidades de negocio en toda Europa</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Transmita la ciudadanía a sus hijos</span>
                    </div>
                  </div>
                    
                    <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <div className="flex items-center text-green-800">
                        <Award className="h-5 w-5 mr-2" />
                        <span className="font-semibold">100% Tasa de Éxito Verdadero</span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        Basado en más de 5,000 solicitudes completadas
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
        </section>

        {/* Quick Eligibility Check */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6" style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
              <span className="text-gray-700 dark:text-gray-300">¿Soy Elegible para la</span>
              <br />
              <span className="text-blue-800 dark:text-blue-400">Ciudadanía Polaca?</span>
            </h2>
            
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12" style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)'
            }}>
              Puede calificar si tiene ancestros polacos. Verifique estos escenarios comunes:
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-white dark:bg-gray-700 border-2 border-blue-100 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Confirmación de Elegibilidad</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Verifique si Califica Primero
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-700 border-2 border-green-100 dark:border-green-800 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Abuelo Polaco</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    El abuelo era ciudadano polaco
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-700 border-2 border-purple-100 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Documentos Polacos</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Tiene certificados de nacimiento polacos
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-8 sm:py-10 text-xl sm:text-2xl font-semibold w-full border border-white rounded-sm shadow-none cursor-pointer"
                onClick={() => {
                  window.location.href = '/#top';
                }}
              >
                Visite Nuestro Portal de Ciudadanía Polaca
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-8 sm:py-10 text-xl sm:text-2xl font-semibold w-full border border-white rounded-sm shadow-none cursor-pointer transition-all duration-200 transform hover:scale-105"
                onClick={() => {
                  window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
                }}
              >
                Realizar Examen Completo de Ciudadanía Polaca
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6" style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                letterSpacing: '-0.02em',
                lineHeight: '1.2'
              }}>
                <span className="text-gray-700 dark:text-gray-300">Proceso de Solicitud</span>
                <br />
                <span className="text-blue-800 dark:text-blue-400">Simple de 3 Pasos</span>
              </h2>
              <p className="text-xl sm:text-2xl text-gray-600" style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.5rem)'
              }}>
                Nosotros manejamos el trabajo legal complejo mientras usted se enfoca en su futuro
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Verificación de Elegibilidad
                </h3>
                <p className="text-gray-600 mb-4">
                  Realice nuestra evaluación de 15 minutos para determinar su estado de calificación
                </p>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  15 minutos
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Preparación de Documentos
                </h3>
                <p className="text-gray-600 mb-4">
                  Reunimos y traducimos todos los documentos requeridos de los archivos polacos
                </p>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  3-9 meses
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Procedimiento de Ciudadanía
                </h3>
                <p className="text-gray-600 mb-4">
                  Presentamos la solicitud y recibe su certificado de ciudadanía polaca
                </p>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  18-36 meses
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 bg-blue-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8" style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              letterSpacing: '-0.02em'
            }}>
              Confianza de Miles en Todo el Mundo
            </h2>
            
            <div className="bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-600 dark:border-blue-400 p-6 mx-auto max-w-5xl text-left mb-12">
              <p className="text-lg text-blue-800 font-semibold">
                Proporcionamos TESTIMONIOS EN VIDEO de nuestros mejores Clientes reales con sus datos de contacto que están disponibles para compartir su experiencia - con tecnología IA que verifica y confirma su autenticidad.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">5,000+</div>
                <div className="text-gray-600">Solicitudes Exitosas</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-gray-600">Tasa de Éxito Verdadero</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600">Monitoreo de Casos</div>
              </div>
            </div>
            
            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 italic mb-4">
                  "Gracias a su orientación experta, obtuve exitosamente mi ciudadanía polaca 
                  y pasaporte UE. El proceso fue fluido y bien organizado."
                </blockquote>
                <div className="text-gray-600">
                  <strong>Sarah Johnson</strong> - USA → Polonia → UE
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA - Performance Optimized */}
        <section className="py-20 bg-gradient-to-r from-blue-800 to-blue-900 min-h-[400px] flex items-center performance-optimized lazy-section">
          <div className="container mx-auto px-4 max-w-4xl text-center text-white w-full">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
              Comience Su Viaje hacia la Ciudadanía UE Hoy
            </h2>
            <p className="text-xl sm:text-2xl mb-8 opacity-90" style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)'
            }}>
              Únase a miles que ya han asegurado su futuro europeo a través de la ascendencia polaca
            </p>
            
            <div className="flex flex-col gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-8 sm:py-10 text-xl sm:text-2xl font-semibold w-full border border-white rounded-sm shadow-none cursor-pointer"
                onClick={() => {
                  window.location.href = '/#top';
                }}
              >
                Visite Nuestro Portal de Ciudadanía Polaca
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-8 sm:py-10 text-xl sm:text-2xl font-semibold w-full border border-white rounded-sm shadow-none cursor-pointer transition-all duration-200 transform hover:scale-105"
                onClick={() => {
                  window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
                }}
              >
                Realizar Examen Completo de Ciudadanía Polaca
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center justify-center text-sm opacity-75">
              <Shield className="h-4 w-4 mr-2" />
              <span>100% Confidencial • Sin Obligación • Evaluación Gratuita</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default LandingPageSpanish;