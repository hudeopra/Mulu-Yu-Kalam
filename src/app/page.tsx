import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { AboutSection } from "@/components/AboutSection";
import { GallerySection } from "@/components/GallerySection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { PublicLandingClient } from "@/components/PublicLandingClient";

export default function HomePage() {
  return (
    <PublicLandingClient>
      <Header />
      <main className="flex-1">
        <HeroBanner />
        <AboutSection />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
    </PublicLandingClient>
  );
}
