import { Header } from '@/components/landing/Header';
import { HeroBanner } from '@/components/landing/HeroBanner';
import { AboutSection } from '@/components/landing/AboutSection';
import { GallerySection } from '@/components/landing/GallerySection';
import { ContactSection } from '@/components/landing/ContactSection';
import { Footer } from '@/components/landing/Footer';
import { landingService } from '@/services/landing';

export const revalidate = 60;

export default async function HomePage() {
  const [settings, aboutData, galleryData] = await Promise.all([
    landingService.getSettings(),
    landingService.getAbout(),
    landingService.getGallery(),
  ]);

  return (
    <div className="custom-cursor-page min-h-screen flex flex-col bg-white text-gray-900 selection:bg-[#ff7b01] selection:text-white font-sans antialiased">
      <Header logoUrl={settings.logo_url} />
      <main className="flex-1">
        <HeroBanner
          bannerBgUrl={settings.banner_image_url}
          showcaseItems={galleryData.hero}
        />
        <AboutSection aboutData={aboutData} settings={settings} />
        <GallerySection galleryItems={galleryData.gallery} />
        <ContactSection settings={settings} />
      </main>
      <Footer copyrightText={settings.copyright_text} />
    </div>
  );
}
