import { Header } from '@/components/landing/Header';
import { HeroBanner } from '@/components/landing/HeroBanner';
import { AboutSection } from '@/components/landing/AboutSection';
import { GallerySection } from '@/components/landing/GallerySection';
import { ContactSection } from '@/components/landing/ContactSection';
import { Footer } from '@/components/landing/Footer';
import { PublicLandingClient } from '@/components/ui/PublicLandingClient';

export default function HomePage() {
  return (
    <div className="custom-cursor-page min-h-screen flex flex-col bg-white text-gray-900 selection:bg-[#ff7b01] selection:text-white font-sans antialiased">
      <PublicLandingClient />
      <Header />
      <main className="flex-1">
        <HeroBanner />
        <AboutSection />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
