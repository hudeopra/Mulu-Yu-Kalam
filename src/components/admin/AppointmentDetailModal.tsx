import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  supabase,
  type Appointment,
  type AppointmentStatus,
  type DepositStatus,
} from "../../lib/supabase";

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentUpdated: (updated: Appointment) => void;
  onAppointmentDeleted: (id: string) => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onAppointmentUpdated,
  onAppointmentDeleted,
}) => {
  // Form edit states
  const [status, setStatus] = useState<AppointmentStatus>("pending");
  const [depositStatus, setDepositStatus] = useState<DepositStatus>("unpaid");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState<string>("");
  const [internalNotes, setInternalNotes] = useState<string>("");

  // Interaction / Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

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
      setInternalNotes(appointment.internal_notes || "");
      setShowDeleteConfirm(false);
      setFeedbackMessage(null);
      setShowImageLightbox(false);
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  // Clean phone number for WhatsApp wa.me link
  const phoneDigits = appointment.phone.replace(/[^0-9]/g, "");
  // If no country code, default to Nepal code 977 if 10 digits starting with 9
  const whatsappNumber =
    phoneDigits.length === 10 && phoneDigits.startsWith("9")
      ? `977${phoneDigits}`
      : phoneDigits;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMessage(null);

    const numericPrice =
      estimatedPrice.trim() === "" ? null : parseFloat(estimatedPrice);

    try {
      const { data, error } = await supabase
        .from("appointments")
        .update({
          status,
          deposit_status: depositStatus,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          estimated_price: numericPrice,
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

      setFeedbackMessage({
        type: "success",
        text: "Appointment updated successfully!",
      });
      onAppointmentUpdated(data as Appointment);

      setTimeout(() => {
        setFeedbackMessage(null);
      }, 3000);
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
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointment.id);

      if (error) {
        throw error;
      }

      onAppointmentDeleted(appointment.id);
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete appointment.";
      setFeedbackMessage({ type: "error", text: errorMsg });
      setIsDeleting(false);
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
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ffecd0] text-[#ff7b01] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="modal-title"
                    className="text-lg sm:text-xl font-bold text-[#2e0249]"
                  >
                    Appointment Details
                  </h2>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(status)}`}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  ID:{" "}
                  <span className="font-mono text-gray-600">
                    {appointment.id}
                  </span>{" "}
                  &bull; Booked on{" "}
                  {new Date(appointment.created_at).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </p>
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
          </div>

          {/* Feedback alert banner */}
          {feedbackMessage && (
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
          )}

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
                      {whatsappNumber && (
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
                      )}
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
                  </div>

                  {appointment.notes && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mb-1">
                        Client Concept & Instructions:
                      </p>
                      <p className="text-xs text-gray-700 italic bg-white/70 p-2.5 rounded-xl border border-gray-200">
                        &ldquo;{appointment.notes}&rdquo;
                      </p>
                    </div>
                  )}
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
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700">
                        Appointment Date
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                        <input
                          type="date"
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          required
                          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700">
                        Appointment Time
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={appointmentTime}
                          onChange={(e) => setAppointmentTime(e.target.value)}
                          placeholder="e.g. 11:00 AM"
                          required
                          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financials: Estimated Price & Deposit Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700">
                        Estimated Price (NPR / USD)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={estimatedPrice}
                          onChange={(e) => setEstimatedPrice(e.target.value)}
                          placeholder="e.g. 5000"
                          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-700">
                        Deposit Status
                      </label>
                      <select
                        value={depositStatus}
                        onChange={(e) =>
                          setDepositStatus(e.target.value as DepositStatus)
                        }
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01]"
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="partial">Partial Deposit</option>
                        <option value="paid">Fully Paid</option>
                      </select>
                    </div>
                  </div>

                  {/* Internal Staff Notes */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Private Internal Notes (Staff only)
                    </label>
                    <textarea
                      rows={3}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="e.g. Requires stencil resizing; custom color ink prepared; client has low pain tolerance..."
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-[#2e0249] focus:outline-none focus:ring-2 focus:ring-[#ff7b01]/30 focus:border-[#ff7b01] resize-none"
                    />
                  </div>
                </form>
              </div>

              {/* Right Column: Reference Artwork Preview */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200/80 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[#2e0249] text-sm mb-3 flex items-center justify-between">
                      <span>Artwork Reference</span>
                      {appointment.reference_image_url && (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Uploaded
                        </span>
                      )}
                    </h3>

                    {appointment.reference_image_url ? (
                      <div className="space-y-3">
                        <div
                          onClick={() => setShowImageLightbox(true)}
                          className="group relative aspect-square w-full rounded-2xl overflow-hidden bg-black/5 border border-gray-200 cursor-zoom-in shadow-xs"
                        >
                          <img
                            src={appointment.reference_image_url}
                            alt="Tattoo Reference"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-medium">
                            <ZoomIn className="w-4 h-4" />
                            <span>Click to Zoom</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={appointment.reference_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#2e0249] text-xs font-semibold shadow-2xs transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open in New Tab</span>
                          </a>

                          <a
                            href={appointment.reference_image_url}
                            download={`mulu_tattoo_ref_${appointment.id}`}
                            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#2e0249] shadow-2xs transition-colors"
                            title="Download reference image"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                        <MapPin className="w-8 h-8 text-gray-300 mb-2" />
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

                  {/* Danger Zone: Delete */}
                  <div className="pt-6 border-t border-gray-200 mt-6">
                    {!showDeleteConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete this Appointment</span>
                      </button>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-bold text-red-800">
                          Confirm Deletion?
                        </p>
                        <p className="text-[11px] text-red-600 leading-tight">
                          This action cannot be undone and will permanently
                          remove this record.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {isDeleting ? "Deleting..." : "Yes, Delete"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="py-1.5 px-2.5 rounded-lg bg-white border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
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
        </div>
      </div>

      {/* Lightbox Modal for High-Res Artwork Zoom */}
      {showImageLightbox && appointment.reference_image_url && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowImageLightbox(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setShowImageLightbox(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={appointment.reference_image_url}
              alt="Reference High-Res"
              className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};
