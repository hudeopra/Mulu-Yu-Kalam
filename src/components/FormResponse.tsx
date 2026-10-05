'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { type Appointment, getAppointmentReferenceUrls } from '../lib/supabase';

export interface FormResponseProps {
  appointment: Appointment;
  onBookAnother?: () => void;
}

export const ReferenceArtworkPreview: React.FC<{ urls: string[] }> = ({ urls }) => {
  if (urls.length === 0) return null;

  return (
    <div className="pt-2">
      <span className="text-neutral-900 text-base block mb-2 font-medium">
        Uploaded Reference{' '}
        {urls.length === 1 ? 'Artwork:' : `Artworks (${urls.length}):`}
      </span>
      <div className="flex flex-wrap gap-2">
        {urls.map((url, idx) => (
          <a
            key={idx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block"
            title={`View reference artwork ${idx + 1}`}
          >
            <img
              src={url}
              alt={`Tattoo reference ${idx + 1}`}
              className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm group-hover:scale-105 transition-transform"
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export const FormResponse: React.FC<FormResponseProps> = ({
  appointment,
  onBookAnother,
}) => {
  const refUrls = getAppointmentReferenceUrls(appointment);

  return (
    <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <div className="flex justify-center gap-4 items-center">
          <div className="text-brand-primary rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#2e0249]">
            Booking Request Received!
          </h3>
        </div>
        <p className="text-gray-600 mt-3 text-base sm:text-lg leading-relaxed">
          Thanks,{' '}
          <span className="font-semibold text-brand-primary">
            {appointment.name}
          </span>
          ! We’ve got your request down for a tattoo on your{' '}
          <span className="font-semibold text-brand-primary">
            {appointment.tattoo_location}
          </span>{' '}
          on{' '}
          <span className="font-semibold text-brand-primary">
            {appointment.appointment_date}
          </span>{' '}
          at{' '}
          <span className="font-semibold text-brand-primary">
            {appointment.appointment_time}
          </span>
          . Our team will reach out to{' '}
          <span className="font-semibold text-brand-primary">
            {appointment.phone}
          </span>{' '}
          shortly to finalize the details and lock in your spot.
        </p>
      </div>

      <div className="mx-auto space-y-3 flex justify-center text-sm">
        <ReferenceArtworkPreview urls={refUrls} />
      </div>

      {onBookAnother && (
        <button
          type="button"
          onClick={onBookAnother}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#ff7b01] text-white font-semibold shadow-lg hover:bg-[#e06c00] transition-colors cursor-pointer"
        >
          Book Another Session
        </button>
      )}
    </div>
  );
};
