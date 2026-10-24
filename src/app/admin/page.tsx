'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  LogOut,
  ExternalLink,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock4,
  PenTool,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  supabase,
  type Appointment,
  type AppointmentStatus,
  computeAppointmentStats,
} from '@/lib/supabase';
import { appointmentsService } from '@/services';
import { AppointmentDetailModal } from '@/components/admin/AppointmentDetailModal';
import { AppointmentDataTable } from '@/components/admin/appointment-table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { user, signOut } = useAuth();

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inspector Modal State
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch appointments from Supabase (excluding soft-deleted / suspended records)
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await appointmentsService.getActiveAppointments();
      setAppointments(data);
    } catch (err: unknown) {
      console.error('[AdminPage] Fetch Error:', err);
      const msg =
        err instanceof Error ? err.message : 'Failed to fetch appointments.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up Supabase Realtime Subscription + Auto-refresh on Tab Focus
  useEffect(() => {
    fetchAppointments();

    const channel = supabase
      .channel('admin_appointments_stream')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as Appointment;
            if (newRow.status !== 'suspended') {
              setAppointments((prev) => [newRow, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Appointment;
            setAppointments((prev) => {
              if (updated.status === 'suspended') {
                return prev.filter((item) => item.id !== updated.id);
              }
              const exists = prev.some((item) => item.id === updated.id);
              if (exists) {
                return prev.map((item) =>
                  item.id === updated.id ? updated : item,
                );
              }
              return [updated, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string };
            setAppointments((prev) =>
              prev.filter((item) => item.id !== deleted.id),
            );
          }
        },
      )
      .subscribe((subStatus) => {
        if (subStatus !== 'SUBSCRIBED') {
          console.warn(
            '[Supabase Realtime] Realtime subscription inactive. Using HTTP polling fallback.',
          );
        }
      });

    // Auto-refresh when staff returns to the browser tab
    const handleFocus = () => {
      fetchAppointments();
    };
    window.addEventListener('focus', handleFocus);

    // Fallback polling every 30s to keep feed fresh
    const pollInterval = setInterval(() => {
      fetchAppointments();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
      clearInterval(pollInterval);
    };
  }, [fetchAppointments]);

  // Handle modal update callback
  const handleAppointmentUpdated = (updated: Appointment) => {
    setAppointments((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelectedAppointment(updated);
  };

  // Handle modal delete callback
  const handleAppointmentDeleted = (deletedId: string) => {
    setAppointments((prev) => prev.filter((item) => item.id !== deletedId));
    setSelectedAppointment(null);
  };

  // Quick status toggle directly from table action
  const handleQuickStatusChange = async (
    id: string,
    newStatus: AppointmentStatus,
  ) => {
    try {
      const updated = await appointmentsService.updateAppointmentStatus(
        id,
        newStatus,
      );
      handleAppointmentUpdated(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed';
      alert(`Could not update status: ${msg}`);
    }
  };

  // Statistics metrics (computed in single pass O(N), strictly excluding suspended)
  const stats = useMemo(
    () => computeAppointmentStats(appointments),
    [appointments],
  );

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col font-sans text-gray-900 selection:bg-[#ff7b01] selection:text-white">
      {/* Admin Top Navigation Bar */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-3 group">
              <Image
                src="/assets/img/Mulu-Yu-Kalam.svg"
                alt="Mulu Yu Kalam"
                width={160}
                height={42}
                priority
                className="w-40 h-auto drop-shadow-xs"
              />
            </Link>

            {/* Unified Admin Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl">
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#2e0249] shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5 text-[#ff7b01]" />
                <span>Appointments</span>
              </Link>
              <Link
                href="/cms"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-white/60 transition-colors"
              >
                <PenTool className="w-3.5 h-3.5 text-gray-500" />
                <span>Blog & Content</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#ff7b01] px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span>View Public Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="h-6 w-px bg-gray-200 hidden sm:block" />

            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[#2e0249] truncate max-w-[180px]">
                {user?.email}
              </p>
              <p className="text-[10px] text-gray-400">Authenticated Staff</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-xs font-semibold border-none cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#2e0249] via-[#3b075e] to-[#2e0249] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#2e0249]/10">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-200">
                Studio Appointments Feed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tattoo Appointments
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              Review and inspect client tattoo concepts, confirm or reschedule
              sessions, update pricing & deposits, and communicate with clients.
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[url('/assets/img/bg-img.svg')] bg-contain bg-no-repeat bg-right opacity-15 pointer-events-none" />
        </div>

        {/* Studio Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ffecd0] text-[#ff7b01] flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Total Bookings
              </p>
              <p className="text-2xl font-extrabold text-[#2e0249]">
                {stats.total}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock4 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Pending Review
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-extrabold text-amber-600">
                  {stats.pending}
                </p>
                {stats.pending > 0 ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 animate-pulse">
                    Action Needed
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Confirmed
              </p>
              <p className="text-2xl font-extrabold text-emerald-600">
                {stats.confirmed}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Completed Works
              </p>
              <p className="text-2xl font-extrabold text-blue-600">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMessage ? (
          <Alert
            variant="destructive"
            className="rounded-2xl p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <AlertDescription className="flex-1 text-xs font-semibold">
              {errorMessage}
            </AlertDescription>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAppointments}
              className="bg-red-100 hover:bg-red-200 text-red-900 border-none cursor-pointer"
            >
              Retry
            </Button>
          </Alert>
        ) : null}

        {/* TanStack Data Table for Appointments */}
        <AppointmentDataTable
          data={appointments}
          stats={stats}
          isLoading={isLoading}
          onRefresh={fetchAppointments}
          onViewDetails={(app) => {
            setSelectedAppointment(app);
            setIsModalOpen(true);
          }}
          onQuickStatusChange={handleQuickStatusChange}
        />
      </main>

      {/* Appointment Detail Inspector Modal (Mounted independently per appointment) */}
      {isModalOpen && selectedAppointment ? (
        <AppointmentDetailModal
          key={selectedAppointment.id}
          appointment={selectedAppointment}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAppointment(null);
          }}
          onAppointmentUpdated={handleAppointmentUpdated}
          onAppointmentDeleted={handleAppointmentDeleted}
        />
      ) : null}
    </div>
  );
}
