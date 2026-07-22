import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  ExternalLink,
  Calendar,
  Users,
  Clock,
  ShieldCheck,
  Search,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock4,
  Eye,
  MapPin,
  Mail,
  Phone,
  Image as ImageIcon,
} from "lucide-react";
import { Link } from "react-router";
import {
  supabase,
  type Appointment,
  type AppointmentStatus,
} from "../lib/supabase";
import { AppointmentDetailModal } from "../components/admin/AppointmentDetailModal";

export const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>(
    "all",
  );
  const [sortBy, setSortBy] = useState<"newest" | "upcoming">("newest");

  // Modal State
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch appointments from Supabase
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setAppointments((data as Appointment[]) || []);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch appointments.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and Realtime channel subscription
  useEffect(() => {
    fetchAppointments();

    const channel = supabase
      .channel("appointments-realtime-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRecord = payload.new as Appointment;
            setAppointments((prev) => [newRecord, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            const updatedRecord = payload.new as Appointment;
            setAppointments((prev) =>
              prev.map((app) =>
                app.id === updatedRecord.id ? updatedRecord : app,
              ),
            );
            // If the currently inspected modal is the updated record, update it too
            setSelectedAppointment((prev) =>
              prev && prev.id === updatedRecord.id ? updatedRecord : prev,
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id: string }).id;
            setAppointments((prev) =>
              prev.filter((app) => app.id !== deletedId),
            );
            setSelectedAppointment((prev) =>
              prev && prev.id === deletedId ? null : prev,
            );
          }
        },
      )
      .subscribe((status) => {
        // Status transitions: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR'
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          // Gracefully fallback to standard REST queries if realtime replication isn't enabled in Supabase yet
          console.warn(
            "[Supabase Realtime] Realtime subscription inactive. Using HTTP polling fallback.",
          );
        }
      });

    // Auto-refresh when staff returns to the browser tab
    const handleFocus = () => {
      fetchAppointments();
    };
    window.addEventListener("focus", handleFocus);

    // Fallback polling every 30s to keep feed fresh even if Realtime is disabled on the database
    const pollInterval = setInterval(() => {
      fetchAppointments();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", handleFocus);
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

  // Quick status toggle directly from list/table
  const handleQuickStatusChange = async (
    e: React.MouseEvent,
    id: string,
    newStatus: AppointmentStatus,
  ) => {
    e.stopPropagation();
    try {
      const { data, error } = await supabase
        .from("appointments")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        handleAppointmentUpdated(data as Appointment);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Status update failed";
      alert(`Could not update status: ${msg}`);
    }
  };

  // Filtered & Sorted Appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((app) => {
        // Status filter
        if (statusFilter !== "all" && app.status !== statusFilter) {
          return false;
        }

        // Search query filter (matches name, email, phone, location)
        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();
          const matchName = app.name?.toLowerCase().includes(query);
          const matchEmail = app.email?.toLowerCase().includes(query);
          const matchPhone = app.phone?.toLowerCase().includes(query);
          const matchLocation = app.tattoo_location
            ?.toLowerCase()
            .includes(query);
          return matchName || matchEmail || matchPhone || matchLocation;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "upcoming") {
          return (
            new Date(a.appointment_date).getTime() -
            new Date(b.appointment_date).getTime()
          );
        }
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
  }, [appointments, statusFilter, searchQuery, sortBy]);

  // Statistics metrics
  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === "pending").length;
    const confirmed = appointments.filter(
      (a) => a.status === "confirmed",
    ).length;
    const completed = appointments.filter(
      (a) => a.status === "completed",
    ).length;
    return { total, pending, confirmed, completed };
  }, [appointments]);

  const getStatusBadge = (s: AppointmentStatus) => {
    switch (s) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "canceled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col font-sans text-gray-900 selection:bg-[#ff7b01] selection:text-white">
      {/* Admin Top Navigation Bar */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-3 group">
              <img
                src="/assets/img/Mulu-Yu-Kalam.svg"
                alt="Mulu Yu Kalam"
                className="w-40 h-auto drop-shadow-xs"
              />
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-[#ff7b01] bg-[#ffecd0] px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Staff
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
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

            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Welcome Hero Banner */}
        <div className="bg-gradient-to-r from-[#2e0249] to-[#45096b] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#ffbd5b] bg-white/10 px-3 py-1 rounded-full">
              Studio Portal &bull; Live Appointments
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Studio Management Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              Real-time feed of booking requests. Review artwork references,
              reschedule sessions, update pricing & deposits, and communicate
              with clients.
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
                {stats.pending > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 animate-pulse">
                    Action Needed
                  </span>
                )}
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

        {/* Filter & Search Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by client name, email, phone, or placement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown & Refresh Button */}
            <div className="flex items-center gap-2 justify-end">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "newest" | "upcoming")
                  }
                  className="bg-transparent text-xs font-semibold text-[#2e0249] focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="upcoming">Upcoming Session Date</option>
                </select>
              </div>

              <button
                type="button"
                onClick={fetchAppointments}
                disabled={isLoading}
                title="Refresh feed"
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin text-[#ff7b01]" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none border-t border-gray-100 pt-3">
            <span className="text-gray-400 mr-2 text-[11px] uppercase tracking-wider font-bold">
              Filter Status:
            </span>
            {(
              [
                { id: "all", label: "All", count: appointments.length },
                { id: "pending", label: "Pending", count: stats.pending },
                { id: "confirmed", label: "Confirmed", count: stats.confirmed },
                { id: "completed", label: "Completed", count: stats.completed },
                {
                  id: "canceled",
                  label: "Canceled",
                  count: appointments.filter((a) => a.status === "canceled")
                    .length,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? "bg-[#2e0249] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-800 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button
              type="button"
              onClick={fetchAppointments}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-red-900 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Appointments Table / Cards View */}
        <div className="bg-white rounded-3xl border border-black/5 shadow-xs overflow-hidden">
          {isLoading && appointments.length === 0 ? (
            /* Loading State */
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#ff7b01] animate-spin mx-auto" />
              <p className="text-sm font-semibold text-[#2e0249]">
                Loading appointment bookings...
              </p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#2e0249]">
                No appointments found
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {searchQuery
                  ? `No bookings match your search query "${searchQuery}". Try a different keyword.`
                  : statusFilter !== "all"
                    ? `There are currently no appointments in the "${statusFilter}" category.`
                    : "New client bookings submitted from the landing page will automatically stream here in real time."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-bold text-[#ff7b01] hover:underline"
                >
                  Clear search filters
                </button>
              )}
            </div>
          ) : (
            /* Table for Large Screens */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Client</th>
                    <th className="py-3.5 px-4">Placement</th>
                    <th className="py-3.5 px-4">Session Date</th>
                    <th className="py-3.5 px-4">Artwork</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Quote / Deposit</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredAppointments.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => {
                        setSelectedAppointment(app);
                        setIsModalOpen(true);
                      }}
                      className="hover:bg-orange-50/30 transition-colors cursor-pointer group"
                    >
                      {/* Client Info */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="space-y-0.5">
                          <p className="font-bold text-[#2e0249] group-hover:text-[#ff7b01] transition-colors text-sm">
                            {app.name}
                          </p>
                          <div className="flex flex-col text-[11px] text-gray-500 gap-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />{" "}
                              {app.phone}
                            </span>
                            <span className="flex items-center gap-1 truncate max-w-[180px]">
                              <Mail className="w-3 h-3 text-gray-400" />{" "}
                              {app.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tattoo Placement */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-semibold text-[11px] capitalize border border-purple-100">
                          <MapPin className="w-3 h-3" />
                          {app.tattoo_location}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-gray-900">
                            {new Date(app.appointment_date).toLocaleDateString(
                              undefined,
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {app.appointment_time}
                          </p>
                        </div>
                      </td>

                      {/* Reference Artwork Thumbnail */}
                      <td className="py-4 px-4">
                        {app.reference_image_url ? (
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-2xs">
                            <img
                              src={app.reference_image_url}
                              alt="Tattoo reference preview"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      {/* Status Pill with dropdown quick toggles */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusBadge(
                            app.status,
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>

                      {/* Financials: Quote & Deposit */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-[#2e0249]">
                            {app.estimated_price !== null &&
                            app.estimated_price !== undefined
                              ? `NPR ${app.estimated_price.toLocaleString()}`
                              : "No Quote Yet"}
                          </p>
                          <span
                            className={`inline-block text-[10px] font-semibold px-2 py-0.2 rounded-full uppercase ${
                              app.deposit_status === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : app.deposit_status === "partial"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            Deposit: {app.deposit_status}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Quick confirm button for pending */}
                          {app.status === "pending" && (
                            <button
                              type="button"
                              onClick={(e) =>
                                handleQuickStatusChange(e, app.id, "confirmed")
                              }
                              title="Quick Confirm"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Quick complete button for confirmed */}
                          {app.status === "confirmed" && (
                            <button
                              type="button"
                              onClick={(e) =>
                                handleQuickStatusChange(e, app.id, "completed")
                              }
                              title="Mark Completed"
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* View Inspector Modal */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(app);
                              setIsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 group-hover:bg-[#ff7b01] group-hover:text-white text-[#2e0249] font-bold text-xs transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Appointment Detail Inspector Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
        onAppointmentUpdated={handleAppointmentUpdated}
        onAppointmentDeleted={handleAppointmentDeleted}
      />
    </div>
  );
};
