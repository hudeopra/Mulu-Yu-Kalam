import React from "react";
import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { AboutSection } from "./components/AboutSection";
import { GallerySection } from "./components/GallerySection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-[#ff7b01] selection:text-white font-sans antialiased">
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
};

export default App;
