import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect immediately to /admin
  useEffect(() => {
    if (user) {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await signIn(email, password);

      if (error) {
        setErrorMessage(
          error.message || "Invalid login credentials. Please try again.",
        );
        return;
      }

      // Success: redirect to admin dashboard
      navigate("/admin", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#faf7f2] px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#ff7b01] selection:text-white">
      {/* Decorative background watermark */}
      <div className="absolute inset-0 bg-[url('/assets/img/banner-bg.jpg')] bg-cover bg-center opacity-10 pointer-events-none" />

      {/* Back to website button */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-black/5 text-gray-700 text-sm font-semibold hover:bg-white hover:text-[#ff7b01] transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio</span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Studio Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <img
              src="/assets/img/Mulu-Yu-Kalam.svg"
              alt="Mulu Yu Kalam"
              className="w-56 h-auto mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#ff7b01] bg-[#ffecd0] px-4 py-1.5 rounded-full inline-flex">
            <ShieldCheck className="w-4 h-4" /> Studio Staff Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2e0249] mt-3 tracking-tight">
            Sign In to Dashboard
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Access appointment management & client records
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-black/5">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs">Authentication Failed</p>
                <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@muluyukalam.com"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-[#2e0249] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your staff password"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-12 py-3 text-[#2e0249] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#ff7b01] text-white font-bold text-base shadow-lg shadow-[#ff7b01]/30 hover:bg-[#e66f00] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In to Admin</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Staff accounts are managed in Supabase Auth. Contact studio owner
              for access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
