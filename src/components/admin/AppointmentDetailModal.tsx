'use client';

import { useState, useEffect, type FormEvent } from 'react';
import {
  X,
  FileText,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  type Appointment,
  type AppointmentStatus,
  type DepositStatus,
  getAppointmentStatusBadge,
} from '@/lib/supabase';
import { appointmentsService, getAppointmentReferenceUrls } from '@/services';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AppointmentClientCard,
  AppointmentEditForm,
  AppointmentArtworkViewer,
  AppointmentDeleteDialog,
  ArtworkLightboxModal,
} from './appointment-modal';

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
  const [status, setStatus] = useState<AppointmentStatus>('pending');
  const [depositStatus, setDepositStatus] = useState<DepositStatus>('unpaid');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState<string>('');
  const [partialPaymentAmount, setPartialPaymentAmount] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');

  // Interaction / Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Sync form state whenever selected appointment changes
  useEffect(() => {
    if (appointment) {
      setStatus(appointment.status || 'pending');
      setDepositStatus(appointment.deposit_status || 'unpaid');
      setAppointmentDate(appointment.appointment_date || '');
      setAppointmentTime(appointment.appointment_time || '');
      setEstimatedPrice(
        appointment.estimated_price !== null &&
          appointment.estimated_price !== undefined
          ? String(appointment.estimated_price)
          : '',
      );
      setPartialPaymentAmount(
        appointment.partial_payment_amount !== null &&
          appointment.partial_payment_amount !== undefined
          ? String(appointment.partial_payment_amount)
          : '',
      );
      setInternalNotes(appointment.internal_notes || '');
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

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMessage(null);

    const numericPrice =
      estimatedPrice.trim() === '' || isNaN(Number(estimatedPrice))
        ? null
        : parseFloat(estimatedPrice);
    const numericPartial =
      depositStatus === 'partial' &&
      partialPaymentAmount.trim() !== '' &&
      !isNaN(Number(partialPaymentAmount))
        ? parseFloat(partialPaymentAmount)
        : null;

    try {
      const updated = await appointmentsService.updateAppointment(
        appointment.id,
        {
          status,
          deposit_status: depositStatus,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          estimated_price: numericPrice,
          partial_payment_amount: numericPartial,
          internal_notes:
            internalNotes.trim() === '' ? null : internalNotes.trim(),
        },
      );

      onAppointmentUpdated(updated);
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to update appointment.';
      setFeedbackMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setFeedbackMessage(null);

    try {
      await appointmentsService.suspendAppointment(appointment);
      setShowDeleteConfirm(false);
      onAppointmentDeleted(appointment.id);
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to suspend appointment.';
      setFeedbackMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteActiveImage = async () => {
    if (!activeImageUrl || !appointment) return;
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this reference image from storage?',
    );
    if (!confirmDelete) return;

    setIsDeletingImage(true);
    try {
      const updated = await appointmentsService.deleteAppointmentArtwork(
        appointment,
        activeImageUrl,
      );

      onAppointmentUpdated(updated);
      const remainingUrls = getAppointmentReferenceUrls(updated);
      setSelectedImageIndex((prev) =>
        prev >= remainingUrls.length
          ? Math.max(0, remainingUrls.length - 1)
          : prev,
      );
      setFeedbackMessage({
        type: 'success',
        text: 'Reference image removed from storage and database.',
      });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to remove image.';
      setFeedbackMessage({ type: 'error', text: msg });
    } finally {
      setIsDeletingImage(false);
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
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getAppointmentStatusBadge(status)}`}
                  >
                    {status}
                  </span>
                </div>
                <DialogDescription className="text-xs text-gray-400">
                  Booked on{' '}
                  {new Date(appointment.created_at).toLocaleDateString(
                    undefined,
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
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
                feedbackMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100'
                  : 'bg-red-50 text-red-800 border-b border-red-100'
              }`}
            >
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          ) : null}

          {/* Modal Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Client Profile Card */}
            <AppointmentClientCard appointment={appointment} />

            {/* Split Form & Artwork Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Workflow Controls & Edit Form */}
              <div className="lg:col-span-7 space-y-6">
                <AppointmentEditForm
                  status={status}
                  setStatus={setStatus}
                  depositStatus={depositStatus}
                  setDepositStatus={setDepositStatus}
                  appointmentDate={appointmentDate}
                  setAppointmentDate={setAppointmentDate}
                  appointmentTime={appointmentTime}
                  setAppointmentTime={setAppointmentTime}
                  estimatedPrice={estimatedPrice}
                  setEstimatedPrice={setEstimatedPrice}
                  partialPaymentAmount={partialPaymentAmount}
                  setPartialPaymentAmount={setPartialPaymentAmount}
                  internalNotes={internalNotes}
                  setInternalNotes={setInternalNotes}
                  onSubmit={handleSave}
                />
              </div>

              {/* Right Column: Reference Artwork Preview & Danger Zone */}
              <div className="lg:col-span-5 space-y-4">
                <AppointmentArtworkViewer
                  appointmentId={appointment.id}
                  referenceUrls={referenceUrls}
                  activeImageUrl={activeImageUrl}
                  selectedImageIndex={selectedImageIndex}
                  onSelectImage={setSelectedImageIndex}
                  onOpenLightbox={() => setShowImageLightbox(true)}
                  onDeleteImage={handleDeleteActiveImage}
                  isDeletingImage={isDeletingImage}
                  onRequestDeleteAppointment={() => setShowDeleteConfirm(true)}
                />
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
      <AppointmentDeleteDialog
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      {/* Lightbox Modal for High-Res Artwork Zoom */}
      <ArtworkLightboxModal
        isOpen={showImageLightbox}
        onClose={() => setShowImageLightbox(false)}
        images={referenceUrls}
        activeImage={activeImageUrl}
        currentIndex={selectedImageIndex}
        onNavigate={setSelectedImageIndex}
      />
    </>
  );
}
