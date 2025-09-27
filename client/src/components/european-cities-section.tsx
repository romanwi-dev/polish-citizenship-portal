import { memo } from 'react';
import romeImage from '@assets/34467458-0FCE-4412-ABD7-0A3516E2FA7C_1755167405365.png';
import londonImage from '@assets/54A33AFE-7220-4B0E-9D7C-78C04D7C03EC_1755167405365.png';
import warsawImage from '@assets/9D318191-3AA7-497B-9706-B545A57762F4_1755167405365.png';
import budapestImage from '@assets/FEDDC669-6C37-40B8-BA88-1CD60E01628B_1755167405366.png';
import athensImage from '@assets/0959578B-3425-4932-9253-34078966BDD1_1755167405366.png';
import madridImage from '@assets/4726BF11-CA77-4316-906F-D578A49D66B3_1755167405366.png';
import parisImage from '@assets/F2C4687D-6C8C-411E-A58E-E99D01DCE366_1755168864694.png';
import viennaImage from '@assets/1B66A697-3B8C-4D35-B648-6DEB28BF4990_1755168864694.png';
import stockholmImage from '@assets/7C81A660-73B1-4ECF-B8C2-DBC75D2A64EE_1755168864694.png';
import brusselsImage from '@assets/43CE74D8-2F49-40ED-9F23-E6F61DD240B4_1755169120944.png';

interface EuropeanCityImageProps {
  src: string;
  alt: string;
  className?: string;
}

const EuropeanCityImage = memo(function EuropeanCityImage({ src, alt, className = "" }: EuropeanCityImageProps) {
  return (
    <div className={`w-full ${className}`}>
      <img 
        src={src} 
        alt={alt}
        className="w-full h-80 sm:h-96 md:h-[32rem] lg:h-[40rem] object-cover"
        loading="lazy"
      />
    </div>
  );
});

// Export individual city images for use across the homepage
export const RomeImage = () => (
  <EuropeanCityImage 
    src={romeImage} 
    alt="European city architecture"
  />
);

export const LondonImage = () => (
  <EuropeanCityImage 
    src={londonImage} 
    alt="European city architecture"
  />
);

export const WarsawImage = () => (
  <EuropeanCityImage 
    src={warsawImage} 
    alt="European city architecture"
  />
);

export const BudapestImage = () => (
  <EuropeanCityImage 
    src={budapestImage} 
    alt="European city architecture"
  />
);

export const AthensImage = () => (
  <EuropeanCityImage 
    src={athensImage} 
    alt="European city architecture"
  />
);

export const MadridImage = () => (
  <EuropeanCityImage 
    src={madridImage} 
    alt="European city architecture"
  />
);

export const ParisImage = () => (
  <EuropeanCityImage 
    src={parisImage} 
    alt="European city architecture"
  />
);

export const ViennaImage = () => (
  <EuropeanCityImage 
    src={viennaImage} 
    alt="European city architecture"
  />
);

export const StockholmImage = () => (
  <EuropeanCityImage 
    src={stockholmImage} 
    alt="European city architecture"
  />
);

export const BrusselsImage = () => (
  <EuropeanCityImage 
    src={brusselsImage} 
    alt="European city architecture"
  />
);