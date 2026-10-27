'use client';

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";

export function AdminAuthGuard({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isLoading, signOut } = useAuth();
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

  // Author role has no access to appointment bookings
  const userRole = (user.role as string) || (user.user_metadata?.role as string) || 'author';
  if (userRole === 'author') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-[#2e0249] p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-serif text-[#2e0249]">Access Restricted</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your account role is registered as <strong className="text-[#ff7b01]">Author</strong>. Author accounts can draft and manage articles in the Blog CMS, but do not have access to studio appointment bookings.
          </p>
          <div className="flex flex-col w-full gap-2 pt-2">
            <Link
              href="/cms"
              className="w-full py-2.5 px-4 rounded-xl bg-[#2e0249] hover:bg-[#3d0360] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center"
            >
              Go to Blog CMS
            </Link>
            <button
              onClick={() => signOut()}
              className="w-full py-2 px-4 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors cursor-pointer"
            >
              Sign out / Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
