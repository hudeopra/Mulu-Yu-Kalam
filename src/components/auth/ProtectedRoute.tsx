import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuth();

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
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
