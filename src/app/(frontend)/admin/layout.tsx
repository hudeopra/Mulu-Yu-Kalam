import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Studio Administration Dashboard | Mulu Yu Kalam",
  description: "Internal studio appointments feed, scheduling, and client manager.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-[#faf7f2] flex flex-col md:flex-row">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </AdminAuthGuard>
  );
}
