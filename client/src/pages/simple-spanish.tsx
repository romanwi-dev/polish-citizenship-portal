import { Helmet } from "react-helmet-async";

export default function SimpleSpanish() {
  return (
    <>
      <Helmet>
        <html lang="es" />
        <title>Ciudadanía Polaca por Descendencia - Servicios Legales Expertos</title>
        <meta name="description" content="Servicios legales profesionales para ciudadanía polaca por descendencia. 100% tasa de éxito, cronograma realista de 1.5-4 años." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 text-white">
        
        {/* CONFIRMATION BANNER */}
        <div className="bg-green-600 text-center py-8 text-4xl font-bold">
          ✅ PÁGINA EN ESPAÑOL FUNCIONANDO PERFECTAMENTE
        </div>
        
        {/* HERO SECTION */}
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-7xl font-bold mb-8">
            🇵🇱 CIUDADANÍA POLACA POR DESCENDENCIA 🇪🇸
          </h1>
          
          <h2 className="text-3xl mb-8 text-red-200">
            Orientación legal experta para obtener la ciudadanía polaca y pasaportes de la UE
          </h2>
          
          <p className="text-xl mb-12 leading-relaxed max-w-4xl mx-auto">
            Orientación legal experta para personas de ascendencia polaca y judío-polaca de todo el mundo 
            para obtener la ciudadanía polaca y pasaportes de la UE a través de la ascendencia polaca - 
            tasa de éxito incomparable del 100%, cronograma realista verdadero de 1,5 - 4 años, 
            precios transparentes €3,500+ - €12,500+
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 p-8 rounded-2xl">
              <div className="text-4xl font-bold text-yellow-300">22+ Años</div>
              <div className="text-xl">de Experiencia</div>
            </div>
            <div className="bg-white/10 p-8 rounded-2xl">
              <div className="text-4xl font-bold text-green-300">5,000+ Casos</div>
              <div className="text-xl">Manejados Exitosamente</div>
            </div>
            <div className="bg-white/10 p-8 rounded-2xl">
              <div className="text-4xl font-bold text-blue-300">100% Éxito</div>
              <div className="text-xl">Tasa de Aprobación</div>
            </div>
          </div>
          
          <div className="space-y-6">
            <button className="bg-green-600 hover:bg-green-700 px-12 py-6 text-2xl font-bold rounded-xl shadow-2xl block w-full md:w-auto md:inline-block">
              Complete Su Árbol Genealógico
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 px-12 py-6 text-2xl font-bold rounded-xl shadow-2xl block w-full md:w-auto md:inline-block md:ml-6">
              Realizar Examen Completo de Ciudadanía Polaca
            </button>
          </div>
        </div>
        
        {/* SERVICES SECTION */}
        <div className="bg-white text-gray-800 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-5xl font-bold text-center mb-16 text-red-700">
              NUESTROS SERVICIOS EXPERTOS
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-red-50 p-8 rounded-2xl border-l-4 border-red-600">
                <h3 className="text-2xl font-bold mb-4 text-red-700">Consulta Legal Especializada</h3>
                <p className="text-gray-700">Evaluación completa de su elegibilidad para la ciudadanía polaca basada en su árbol genealógico y documentación familiar.</p>
              </div>
              
              <div className="bg-blue-50 p-8 rounded-2xl border-l-4 border-blue-600">
                <h3 className="text-2xl font-bold mb-4 text-blue-700">Investigación Genealógica</h3>
                <p className="text-gray-700">Búsqueda profesional de documentos históricos y registros en archivos polacos para establecer su línea de descendencia.</p>
              </div>
              
              <div className="bg-green-50 p-8 rounded-2xl border-l-4 border-green-600">
                <h3 className="text-2xl font-bold mb-4 text-green-700">Tramitación Completa</h3>
                <p className="text-gray-700">Gestión integral de todo el proceso de solicitud desde la documentación hasta la obtención del pasaporte europeo.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CONTACT SECTION */}
        <div className="bg-red-700 py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-5xl font-bold mb-8">CONTÁCTANOS HOY</h2>
            <p className="text-2xl mb-8">Comience su camino hacia la ciudadanía europea</p>
            <button className="bg-white text-red-700 px-12 py-6 text-2xl font-bold rounded-xl shadow-2xl hover:bg-gray-100">
              Solicitar Consulta Gratuita
            </button>
          </div>
        </div>
      </div>
    </>
  );
}