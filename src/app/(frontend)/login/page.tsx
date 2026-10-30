'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { InputField, SubmitBtn } from '@/components/shared/forms';
import { loginSchema, type LoginFormData } from '@/schemas';

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/assets/img/Mulu-Yu-Kalam.svg');

  useEffect(() => {
    fetch('/api/admin/landing/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings?.logo_url) setLogoUrl(data.settings.logo_url);
      })
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const getRedirectTarget = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect && redirect.startsWith('/')) {
        return redirect;
      }
    }
    return '/admin';
  };

  // If already logged in, redirect immediately to intended target or /admin
  useEffect(() => {
    if (user) {
      window.location.href = getRedirectTarget();
    }
  }, [user]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        setError('password', {
          message:
            error.message || 'Invalid email or password. Please try again.',
        });
        return;
      }

      // Success: redirect to intended target or /admin
      window.location.href = getRedirectTarget();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError('password', { message });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#faf7f2] px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#ff7b01] selection:text-white">
      {/* Back to website button */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-black/5 text-gray-700 text-sm font-semibold hover:bg-white hover:text-[#ff7b01] transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio</span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Studio Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <Image
              src={logoUrl}
              alt="Mulu Yu Kalam"
              width={224}
              height={60}
              priority
              className="w-56 h-auto mx-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#2e0249] mt-3 tracking-tight">
            Sign In to Dashboard
          </h2>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-black/5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="space-y-5">
              {/* Email Field */}
              <InputField
                label="Staff Email"
                id="login-email"
                type="email"
                icon={Mail}
                {...register('email')}
                error={errors.email?.message}
                autoComplete="email"
              />

              {/* Password Field */}
              <InputField
                label="Password"
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                {...register('password')}
                error={errors.password?.message}
                autoComplete="current-password"
                rightAction={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                }
              />
            </div>

            {/* Submit Button */}
            <SubmitBtn
              isSubmitting={isSubmitting}
              loadingText="Signing in..."
              fullWidth
            >
              Sign In to Admin
            </SubmitBtn>
          </form>
        </div>
      </div>
    </div>
  );
}
