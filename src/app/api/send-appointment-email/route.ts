import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import {
  generateNotificationEmail,
  type EmailTemplateData,
} from '@/lib/emails/notificationEmail';
import { generateBookingConfirmationEmail } from '@/lib/emails/bookingConfirmationEmail';

export async function POST(req: Request) {
  try {
    const body: EmailTemplateData = await req.json();
    const {
      name,
      email,
      number,
      tattooLocation,
      appointmentDate,
      appointmentTime,
      notes,
      referenceImageUrls = [],
    } = body;

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.warn(
        '[Email Route] RESEND_API_KEY is not defined in environment variables. Email notifications skipped.'
      );
      return NextResponse.json(
        {
          success: false,
          message: 'RESEND_API_KEY is not configured on the server.',
        },
        { status: 500 }
      );
    }

    // Configure Nodemailer transporter with Resend SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: resendApiKey,
      },
    });

    const emailData: EmailTemplateData = {
      name,
      email,
      number,
      tattooLocation,
      appointmentDate,
      appointmentTime,
      notes,
      referenceImageUrls,
    };

    // 1. Generate Studio Notification Email (subject, text, html)
    const studioEmail = generateNotificationEmail(emailData);

    // 2. Generate Client Booking Confirmation Email (subject, text, html)
    const clientEmail = generateBookingConfirmationEmail(emailData);

    // Senders:
    // Uses verified Resend domain for sending envelope (or environment override)
    // replyTo is set so studio can directly reply to the client, and client can directly reply to contact@muluyukalam.com.np
    const studioSender =
      process.env.RESEND_STUDIO_FROM ||
      'Support Team <support@maharjanprabin.com.np>';
    const clientEmailSender =
      process.env.RESEND_CLIENT_FROM ||
      'Mulu Yu Kalam Studio <support@maharjanprabin.com.np>';

    // Send both emails concurrently
    const [studioResult, clientResult] = await Promise.allSettled([
      transporter.sendMail({
        from: studioSender,
        to: 'contact@muluyukalam.com.np',
        replyTo: `${name} <${email}>`,
        subject: studioEmail.subject,
        text: studioEmail.text,
        html: studioEmail.html,
      }),
      transporter.sendMail({
        from: clientEmailSender,
        to: email,
        replyTo: 'contact@muluyukalam.com.np',
        subject: clientEmail.subject,
        text: clientEmail.text,
        html: clientEmail.html,
      }),
    ]);

    const studioSuccess = studioResult.status === 'fulfilled';
    const clientSuccess = clientResult.status === 'fulfilled';

    if (!studioSuccess) {
      console.error('[Email Route] Studio notification email error:', studioResult.reason);
    } else {
      console.log('[Email Route] Studio notification sent. Message ID:', studioResult.value.messageId);
    }

    if (!clientSuccess) {
      console.error('[Email Route] Client confirmation email error:', clientResult.reason);
    } else {
      console.log('[Email Route] Client confirmation sent. Message ID:', clientResult.value.messageId);
    }

    return NextResponse.json({
      success: studioSuccess || clientSuccess,
      studioSent: studioSuccess,
      clientSent: clientSuccess,
    });
  } catch (error) {
    console.error('[Email Route] Unexpected error during mail dispatch:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email',
      },
      { status: 500 }
    );
  }
}
