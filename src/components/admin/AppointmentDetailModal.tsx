'use client';

import { useState, useEffect, type FormEvent } from "react";
import Image from "next/image";
import {
  X,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Download,
  Save,
  Loader2,
  MessageCircle,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import {
  supabase,
  type Appointment,
  type AppointmentStatus,
  type DepositStatus,
  getAppointmentReferenceUrls,
  suspendAppointmentStorageImages,
  extractStoragePath,
} from "@/lib/supabase";
import { InputField, SelectField, TextareaField } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentUpdated: (updated: Appointment) => void;
  onAppointmentDeleted: (id: string) => void;
}

export function AppointmentDetailModal({
  appointment,
  isOpen,
  onClose,
  onAppointmentUpdated,
  onAppointmentDeleted,
}: AppointmentDetailModalProps) {
  // Form edit states
  const [status, setStatus] = useState<AppointmentStatus>("pending");
  const [depositStatus, setDepositStatus] = useState<DepositStatus>("unpaid");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState<string>("");
  const [partialPaymentAmount, setPartialPaymentAmount] = useState<string>("");
  const [internalNotes, setInternalNotes] = useState<string>("");

  // Interaction / Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Sync form state whenever selected appointment changes
  useEffect(() => {
    if (appointment) {
      setStatus(appointment.status || "pending");
      setDepositStatus(appointment.deposit_status || "unpaid");
      setAppointmentDate(appointment.appointment_date || "");
      setAppointmentTime(appointment.appointment_time || "");
      setEstimatedPrice(
        appointment.estimated_price !== null &&
          appointment.estimated_price !== undefined
          ? String(appointment.estimated_price)
          : "",
      );
      setPartialPaymentAmount(
        appointment.partial_payment_amount !== null &&
          appointment.partial_payment_amount !== undefined
          ? String(appointment.partial_payment_amount)
          : "",
      );
      setInternalNotes(appointment.internal_notes || "");
      setShowDeleteConfirm(false);
      setFeedbackMessage(null);
      setShowImageLightbox(false);
      setSelectedImageIndex(0);
      setIsDeleting(false);
      setIsSaving(false);
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const referenceUrls = getAppointmentReferenceUrls(appointment);
  const activeImageUrl =
    referenceUrls[selectedImageIndex] || referenceUrls[0] || null;

  // Clean phone number for WhatsApp wa.me link
  const phoneDigits = appointment.phone.replace(/[^0-9]/g, "");
  // If no country code, default to Nepal code 977 if 10 digits starting with 9
  const whatsappNumber =
    phoneDigits.length === 10 && phoneDigits.startsWith("9")
      ? `977${phoneDigits}`
      : phoneDigits;

  const estNum =
    estimatedPrice.trim() === "" ? null : parseFloat(estimatedPrice);
  const partNum =
    partialPaymentAmount.trim() === ""
      ? 0
      : parseFloat(partialPaymentAmount) || 0;
  const remainingDue = estNum !== null ? Math.max(0, estNum - partNum) : null;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMessage(null);

    const numericPrice =
      estimatedPrice.trim() === "" ? null : parseFloat(estimatedPrice);
    const numericPartial =
      depositStatus === "partial" && partialPaymentAmount.trim() !== ""
        ? parseFloat(partialPaymentAmount)
        : null;

    try {
      const { data, error } = await supabase
        .from("appointments")
        .update({
          status,
          deposit_status: depositStatus,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          estimated_price: numericPrice,
          partial_payment_amount: numericPartial,
          internal_notes:
            internalNotes.trim() === "" ? null : internalNotes.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointment.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      onAppointmentUpdated(data as Appointment);
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update appointment.";
      setFeedbackMessage({ type: "error", text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setFeedbackMessage(null);

    try {
      // 1. Rename associated reference images with "suspended-" prefix in Supabase Storage
      const suspendedUrls = await suspendAppointmentStorageImages(appointment);

      // 2. Soft-delete database record by updating status to 'suspended'
      const { error } = await supabase
        .from("appointments")
        .update({
          status: "suspended",
          reference_image_urls:
            suspendedUrls.length > 0
              ? suspendedUrls
              : appointment.reference_image_urls,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointment.id);

      if (error) {
        throw error;
      }

      onAppointmentDeleted(appointment.id);
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to suspend appointment.";
      setFeedbackMessage({ type: "error", text: errorMsg });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteActiveImage = async () => {
    if (!activeImageUrl || !appointment) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this reference image from storage?",
    );
    if (!confirmDelete) return;

    setIsDeletingImage(true);
    try {
      // 1. Remove file from Supabase Storage
      const storagePath = extractStoragePath(activeImageUrl);
      if (storagePath) {
        await supabase.storage.from("tattoo-references").remove([storagePath]);
      }

      // 2. Update remaining URLs in PostgreSQL
      const remainingUrls = referenceUrls.filter(
        (url) => url !== activeImageUrl,
      );

      const { data, error } = await supabase
        .from("appointments")
        .update({
          reference_image_urls:
            remainingUrls.length > 0 ? remainingUrls : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointment.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onAppointmentUpdated(data as Appointment);
        setSelectedImageIndex((prev) =>
          prev >= remainingUrls.length
            ? Math.max(0, remainingUrls.length - 1)
            : prev,
        );
        setFeedbackMessage({
          type: "success",
          text: "Reference image removed from storage and database.",
        });
        setTimeout(() => setFeedbackMessage(null), 3000);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to remove image.";
      setFeedbackMessage({ type: "error", text: msg });
    } finally {
      setIsDeletingImage(false);
    }
  };

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
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="max-w-4xl sm:max-w-4xl w-full p-0 overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-2xl flex flex-col max-h-[92vh] gap-0 text-left"
        >
          {/* Modal Header */}
          <DialogHeader className="px-6 py-5 bg-white border-b border-gray-100 flex flex-row items-center justify-between gap-0 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ffecd0] text-[#ff7b01] flex items-center justify-center font-bold shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg sm:text-xl font-bold text-[#2e0249]">
                    Appointment Details
                  </DialogTitle>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(status)}`}
                  >
                    {status}
                  </span>
                </div>
                <DialogDescription className="text-xs text-gray-400">
                  Booked on{" "}
                  {new Date(appointment.created_at).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </DialogDescription>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>

          {/* Feedback alert banner */}
          {feedbackMessage ? (
            <div
              className={`px-6 py-3 text-xs font-semibold flex items-center gap-2 ${
                feedbackMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-b border-emerald-100"
                  : "bg-red-50 text-red-800 border-b border-red-100"
              }`}
            >
              {feedbackMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          ) : null}

          {/* Modal Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Client & Appointment Information */}
              <div className="lg:col-span-7 space-y-6">
                {/* Client Profile Card */}
                <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#2e0249] text-white flex items-center justify-center font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#2e0249] text-base leading-tight">
                          {appointment.name}
                        </h3>
                        <span className="text-[11px] text-gray-500">
                          Client Info
                        </span>
                      </div>
                    </div>

                    {/* Quick Communication Actions */}
                    <div className="flex items-center gap-1.5">
                      {whatsappNumber ? (
                        <a
                          href={`https://wa.me/${whatsappNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors"
                          title="Open WhatsApp chat"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      ) : null}
                      <a
                        href={`tel:${appointment.phone}`}
                        className="p-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                        title="Call client"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`mailto:${appointment.email}`}
                        className="p-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                        title="Email client"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                        Email
                      </p>
                      <a
                        href={`mailto:${appointment.email}`}
                        className="text-[#2e0249] font-medium hover:text-[#ff7b01] flex items-center gap-1 truncate"
                      >
                        <Mail className="w-3 h-3 shrink-0 text-gray-400" />
                        <span className="truncate">{appointment.email}</span>
                      </a>
                    </div>

                    <div className="space-y-1">
                      <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                        Phone
                      </p>
                      <a
                        href={`tel:${appointment.phone}`}
                        className="text-[#2e0249] font-medium hover:text-[#ff7b01] flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 shrink-0 text-gray-400" />
                        <span>{appointment.phone}</span>
                      </a>
                    </div>

                    <div className="space-y-1">
                      <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                        Tattoo Location
                      </p>
                      <div className="flex items-center gap-1 text-[#2e0249] font-medium">
                        <MapPin className="w-3 h-3 shrink-0 text-[#ff7b01]" />
                        <span className="capitalize">
                          {appointment.tattoo_location}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                        Requested Slot
                      </p>
                      <div className="flex items-center gap-1 text-[#2e0249] font-medium">
                        <Clock className="w-3 h-3 shrink-0 text-[#ff7b01]" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                    </div>

                    <div className="space-y-1 sm:col-span-2 pt-2 border-t border-gray-200">
                      <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                        Payment & Deposit
                      </p>
                      {appointment.deposit_status === "partial" ? (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-[#2e0249]">
                            {appointment.estimated_price !== null &&
                            appointment.estimated_price !== undefined
                              ? `NPR ${appointment.estimated_price.toLocaleString()}`
                              : "No Quote"}
                          </span>
                          <span className="text-gray-300">&bull;</span>
                          <span className="text-gray-600">
                            Paid:{" "}
                            <strong className="text-blue-700 font-semibold">
                              NPR{" "}
                              {(
                                appointment.partial_payment_amount ?? 0
                              ).toLocaleString()}
                            </strong>
                          </span>
                          <span className="text-gray-300">&bull;</span>
                          <span className="text-gray-600">
                            Due:{" "}
                            <strong className="text-amber-600 font-bold">
                              NPR{" "}
                              {appointment.estimated_price !== null &&
                              appointment.estimated_price !== undefined
                                ? Math.max(
                                    0,
                                    appointment.estimated_price -
                                      (appointment.partial_payment_amount ?? 0),
                                  ).toLocaleString()
                                : "—"}
                            </strong>
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full uppercase bg-blue-100 text-blue-800 border border-blue-200 ml-auto">
                            Partial Deposit
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-[#2e0249]">
                            {appointment.estimated_price !== null &&
                            appointment.estimated_price !== undefined
                              ? `NPR ${appointment.estimated_price.toLocaleString()}`
                              : "No Quote Yet"}
                          </span>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.2 rounded-full uppercase border ${
                              appointment.deposit_status === "paid"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}
                          >
                            Deposit: {appointment.deposit_status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {appointment.notes ? (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-1">
                        Client Concept & Instructions:
                      </p>
                      <p className="text-xs text-gray-700 italic bg-white/70 p-2.5 rounded-xl border border-gray-200">
                        &ldquo;{appointment.notes}&rdquo;
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Edit Form */}
                <form
                  id="appointment-edit-form"
                  onSubmit={handleSave}
                  className="space-y-5"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Studio Management & Workflow Controls
                  </h4>

                  {/* Status Toggle Buttons */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Appointment Status
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(
                        [
                          "pending",
                          "confirmed",
                          "completed",
                          "canceled",
                        ] as AppointmentStatus[]
                      ).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatus(st)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer ${
                            status === st
                              ? st === "confirmed"
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : st === "completed"
                                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                  : st === "canceled"
                                    ? "bg-red-600 text-white border-red-600 shadow-xs"
                                    : "bg-amber-500 text-white border-amber-500 shadow-xs"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rescheduling: Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      floatingLabel={false}
                      type="date"
                      label="Appointment Date"
                      labelClassName="block text-xs font-semibold text-gray-700 mb-1.5"
                      containerClassName="space-y-0"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      required
                      icon={<Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01]"
                    />

                    <InputField
                      floatingLabel={false}
                      type="text"
                      label="Appointment Time"
                      labelClassName="block text-xs font-semibold text-gray-700 mb-1.5"
                      containerClassName="space-y-0"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      placeholder="e.g. 11:00 AM"
                      required
                      icon={<Clock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01]"
                    />
                  </div>

                  {/* Financials: Estimated Price & Deposit Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      floatingLabel={false}
                      type="number"
                      step="0.01"
                      min="0"
                      label="Estimated Price (NPR)"
                      labelClassName="block text-xs font-semibold text-gray-700 mb-1.5"
                      containerClassName="space-y-0"
                      value={estimatedPrice}
                      onChange={(e) => setEstimatedPrice(e.target.value)}
                      placeholder="e.g. 5000"
                      icon={<DollarSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01]"
                    />

                    <SelectField
                      label="Deposit Status"
                      labelClassName="block text-xs font-semibold text-gray-700 mb-1.5"
                      containerClassName="space-y-0"
                      value={depositStatus}
                      onChange={(e) =>
                        setDepositStatus(e.target.value as DepositStatus)
                      }
                      options={[
                        { value: 'unpaid', label: 'Unpaid' },
                        { value: 'partial', label: 'Partial Deposit' },
                        { value: 'paid', label: 'Fully Paid' },
                      ]}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01]"
                    />
                  </div>

                  {/* If depositStatus is partial, show simple partial deposit input and remaining balance */}
                  {depositStatus === "partial" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        floatingLabel={false}
                        type="number"
                        step="0.01"
                        min="0"
                        label="Partial Deposit (NPR)"
                        labelClassName="block text-xs font-semibold text-gray-700 mb-1.5"
                        containerClassName="space-y-0"
                        value={partialPaymentAmount}
                        onChange={(e) => setPartialPaymentAmount(e.target.value)}
                        placeholder="e.g. 2000"
                        icon={<DollarSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01]"
                      />

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Remaining Unpaid
                        </label>
                        <div className="w-full bg-amber-50/60 border border-amber-200/80 rounded-xl px-3 py-2 text-xs font-bold text-amber-700 flex items-center h-[37px]">
                          {remainingDue !== null
                            ? `NPR ${remainingDue.toLocaleString()}`
                            : "—"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Internal Staff Notes */}
                  <TextareaField
                    rows={3}
                    label="Private Internal Notes (Staff only)"
                    labelClassName="block text-xs font-semibold text-gray-700 mb-1.5"
                    containerClassName="space-y-0"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="e.g. Requires stencil resizing; custom color ink prepared; client has low pain tolerance..."
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01] resize-none"
                  />
                </form>
              </div>

              {/* Right Column: Reference Artwork Preview */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200/80 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[#2e0249] text-sm mb-3 flex items-center justify-between">
                      <span>Artwork Reference</span>
                      {referenceUrls.length > 0 ? (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                          {referenceUrls.length}{" "}
                          {referenceUrls.length === 1 ? "Image" : "Images"}{" "}
                          Uploaded
                        </span>
                      ) : null}
                    </h3>

                    {activeImageUrl ? (
                      <div className="space-y-3">
                        <div
                          onClick={() => setShowImageLightbox(true)}
                          className="group relative aspect-square w-full rounded-2xl overflow-hidden bg-black/5 border border-gray-200 cursor-zoom-in shadow-xs"
                        >
                          <Image
                            src={activeImageUrl}
                            alt={`Tattoo Reference ${selectedImageIndex + 1}`}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 100vw, 500px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-medium">
                            <ZoomIn className="w-4 h-4" />
                            <span>Click to Zoom</span>
                          </div>
                          {referenceUrls.length > 1 ? (
                            <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
                              {selectedImageIndex + 1} of {referenceUrls.length}
                            </span>
                          ) : null}
                        </div>

                        {/* Thumbnail selector strip if multiple images */}
                        {referenceUrls.length > 1 ? (
                          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                            {referenceUrls.map((url, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedImageIndex(idx)}
                                className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                                  selectedImageIndex === idx
                                    ? "border-[#ff7b01] shadow-md ring-2 ring-[#ff7b01]/20 scale-105"
                                    : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                                }`}
                                title={`View image ${idx + 1}`}
                              >
                                <Image
                                  src={url}
                                  alt={`Thumb ${idx + 1}`}
                                  fill
                                  unoptimized
                                  sizes="56px"
                                  className="object-cover"
                                />
                                <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white text-[9px] font-bold px-1 rounded-sm">
                                  {idx + 1}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : null}

                        <div className="flex items-center gap-2">
                          <a
                            href={activeImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#2e0249] text-xs font-semibold shadow-2xs transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open in New Tab</span>
                          </a>

                          <a
                            href={activeImageUrl}
                            download={`mulu_tattoo_ref_${appointment.id}_${selectedImageIndex + 1}`}
                            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#2e0249] shadow-2xs transition-colors"
                            title="Download reference image"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={handleDeleteActiveImage}
                            disabled={isDeletingImage}
                            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-500 hover:text-red-600 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete this reference image from storage"
                          >
                            {isDeletingImage ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                        <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-xs font-semibold text-gray-600">
                          No Reference Artwork
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          The client did not upload an image during booking.
                          Discuss concept in studio.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Danger Zone: Delete (Soft delete & image renaming) */}
                  <div className="pt-6 border-t border-gray-200 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete this Appointment</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              type="submit"
              form="appointment-edit-form"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff7b01] hover:bg-[#e66f00] text-white text-xs font-bold shadow-md shadow-[#ff7b01]/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete / Suspend Confirmation Alert Dialog (Rendered at root level with independent backdrop) */}
      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialogContent className="bg-white border border-gray-200 shadow-2xl rounded-2xl max-w-md p-6">
          <AlertDialogHeader className="text-left space-y-2">
            <AlertDialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              Suspend Appointment?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-gray-500 leading-relaxed">
              This will soft-delete this appointment from active records
              and tag its reference artwork with &ldquo;suspended-&rdquo; in storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3 bg-transparent border-0 p-0">
            <AlertDialogCancel
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border-0 cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Suspending...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Suspend</span>
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lightbox Modal for High-Res Artwork Zoom */}
      {showImageLightbox && activeImageUrl ? (
        <div
          className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowImageLightbox(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setShowImageLightbox(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 cursor-pointer"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons if multiple images */}
            {referenceUrls.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) =>
                      prev === 0 ? referenceUrls.length - 1 : prev - 1,
                    );
                  }}
                  className="absolute -left-12 sm:-left-16 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white cursor-pointer transition-colors shadow-lg"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) =>
                      prev === referenceUrls.length - 1 ? 0 : prev + 1,
                    );
                  }}
                  className="absolute -right-12 sm:-right-16 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white cursor-pointer transition-colors shadow-lg"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            ) : null}

            <Image
              src={activeImageUrl}
              alt={`Reference High-Res ${selectedImageIndex + 1}`}
              width={1200}
              height={1200}
              unoptimized
              className="max-h-[85vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {referenceUrls.length > 1 ? (
              <span className="mt-3 text-white/80 text-xs font-semibold">
                Image {selectedImageIndex + 1} of {referenceUrls.length}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
};
