import { AdminDashboard } from "@/views/AdminDashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio Administration Dashboard",
  description: "Internal studio appointments feed, scheduling, and client manager.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRoute() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
