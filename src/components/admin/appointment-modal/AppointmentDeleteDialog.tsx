'use client';

import { AlertCircle, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AppointmentDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function AppointmentDeleteDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isDeleting,
}: AppointmentDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white border border-gray-200 shadow-2xl rounded-2xl max-w-md p-6">
        <AlertDialogHeader className="text-left space-y-2">
          <AlertDialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            Suspend Appointment?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-gray-500 leading-relaxed">
            This will soft-delete this appointment from active records and tag
            its reference artwork with &ldquo;suspended-&rdquo; in storage.
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
            onClick={onConfirm}
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
  );
}

