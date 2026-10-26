import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminHeader } from "@/components/admin/AdminHeader";

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
      <AdminHeader />
      {children}
    </AdminAuthGuard>
  );
}
