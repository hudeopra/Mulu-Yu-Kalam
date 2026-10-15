import * as React from 'react';
import { render } from 'react-email';
import { BookingConfirmationEmail } from '@/emails/BookingConfirmationEmail';
import type { EmailTemplateData } from './notificationEmail';

/**
 * Generates Subject, Plain Text, and HTML for the Client Booking Confirmation Email
 * using the modern React Email component.
 */
export async function generateBookingConfirmationEmail(data: EmailTemplateData) {
  const subject = 'Appointment Booking Confirmation - Mulu Yu Kalam Studio';
  const element = React.createElement(BookingConfirmationEmail, data);
  const html = await render(element);
  const text = await render(element, {
    plainText: true,
  });

  return { subject, text, html };
}

