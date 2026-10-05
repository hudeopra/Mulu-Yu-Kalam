'use client';

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export function AdminAuthGuard({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-[#2e0249]">
        <div className="p-6 bg-white rounded-3xl shadow-xl border border-orange-100 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#ff7b01] animate-spin" />
          <p className="font-semibold text-sm tracking-wide text-gray-700">
            Verifying studio credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
