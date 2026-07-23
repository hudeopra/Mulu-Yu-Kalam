import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { AboutSection } from "./components/AboutSection";
import { GallerySection } from "./components/GallerySection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { CursorTrail } from "./components/ui/CursorTrail";
import { Loader2 } from "lucide-react";

const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const AdminDashboard = lazy(() =>
  import("./pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard })),
);

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf7f2] text-[#2e0249]">
    <div className="p-6 bg-white rounded-3xl shadow-xl border border-orange-100 flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-[#ff7b01] animate-spin" />
      <p className="font-semibold text-sm tracking-wide text-gray-700">
        Loading page...
      </p>
    </div>
  </div>
);

const PublicLandingPage: React.FC = () => {
  useEffect(() => {
    document.body.classList.add("custom-cursor-page");
    return () => {
      document.body.classList.remove("custom-cursor-page");
    };
  }, []);

  return (
    <div className="custom-cursor-page min-h-screen flex flex-col bg-white text-gray-900 selection:bg-[#ff7b01] selection:text-white font-sans antialiased">
      <CursorTrail />
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

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {/* 1. Public Studio Landing Page */}
            <Route path="/" element={<PublicLandingPage />} />

            {/* 2. Studio Staff Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* 3. Protected Studio Admin Portal */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback to Public Landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
