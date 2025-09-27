import { Card, CardContent } from "@/components/ui/card";
import { Globe, Briefcase, GraduationCap, Heart } from "lucide-react";

export default function BenefitsSection() {
  const benefits = [
    {
      title: "Freedom of Movement",
      description: "Travel visa-free to 27 EU countries plus many others worldwide",
      icon: Globe,
      color: "bg-primary-blue",
    },
    {
      title: "Work Rights",
      description: "Employment rights in any EU country without work permits",
      icon: Briefcase,
      color: "bg-secondary-blue",
    },
    {
      title: "Education Benefits",
      description: "EU tuition rates and access to European educational programs",
      icon: GraduationCap,
      color: "bg-medium-gray",
    },
    {
      title: "Healthcare Access",
      description: "Quality healthcare coverage throughout the European Union",
      icon: Heart,
      color: "bg-light-blue",
    },
  ];

  const images = [
    {
      src: "https://images.unsplash.com/photo-1609220136736-443140cffec6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      alt: "Multigenerational European family in historic city center",
      title: "Live Anywhere in Europe",
      description:
        "Freely move, travel, live, and work in any of the 27 EU member states without restrictions or visa requirements.",
    },
    {
      src: "https://images.unsplash.com/photo-1571844307880-751c6d86f3f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      alt: "European family enjoying city life together",
      title: "World-Class Education",
      description:
        "Access to outstanding European universities, top high schools, and educational opportunities at EU citizen rates.",
    },
    {
      src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      alt: "Three generations of family in European setting",
      title: "Enjoy a Better Future",
      description:
        "Access to advanced healthcare, business opportunities, and social benefits throughout the European Union.",
    },
  ];

  return (
    <section
      id="benefits"
      className="py-24 bg-surface-very-light"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-warm mb-8">
            Benefits of Polish European Citizenship
          </h2>
          <p className="text-2xl font-semibold text-neutral-cool max-w-4xl mx-auto leading-relaxed">
            With over 20 million people of Polish descent worldwide, obtaining
            Polish citizenship opens doors to extraordinary opportunities across
            Europe.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 mb-20">
          {images.map((image, index) => (
            <div key={index} className="text-center">
              <div className="mb-6">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="rounded-xl shadow-lg w-full h-64 object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-neutral-warm mb-6">
                {image.title}
              </h3>
              <p className="text-neutral-cool text-lg leading-relaxed">{image.description}</p>
            </div>
          ))}
        </div>

        <Card className="shadow-xl bg-surface-elevated border border-gray-100">
          <CardContent className="p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-center text-neutral-warm mb-12">
              Key Advantages of EU Citizenship
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="text-center">
                    <div
                      className={`w-16 h-16 ${benefit.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                      <Icon className="text-white w-8 h-8" />
                    </div>
                    <h4 className="font-semibold text-neutral-warm mb-2">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-neutral-cool">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
