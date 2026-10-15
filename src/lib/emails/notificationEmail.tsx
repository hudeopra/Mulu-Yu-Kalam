import * as React from 'react';
import { render } from 'react-email';
import { NotificationEmail } from '@/emails/NotificationEmail';

export interface EmailTemplateData {
  name: string;
  email: string;
  number: string;
  tattooLocation: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string | null;
  referenceImageUrls?: string[];
  submissionTime?: string;
}

/**
 * Generates Subject, Plain Text, and HTML for the Studio Notification Email
 * using the modern React Email component.
 */
export async function generateNotificationEmail(data: EmailTemplateData) {
  const {
    name,
    submissionTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kathmandu',
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  } = data;

  const subject = `Tattoo appointment book by ${name}`;
  const element = React.createElement(NotificationEmail, {
    ...data,
    submissionTime,
  });
  const html = await render(element);
  const text = await render(element, { plainText: true });

  return { subject, text, html };
}

