import type { EmailTemplateData } from './notificationEmail';

/**
 * Builds HTML image components and links (strictly avoiding table tags)
 */
function renderImagesHtml(referenceImageUrls: string[]): string {
  if (!referenceImageUrls || referenceImageUrls.length === 0) {
    return `<p style="color: #666; font-style: italic; margin: 8px 0;">No reference artwork uploaded.</p>`;
  }

  return `
    <div style="margin-top: 15px;">
      <p style="font-weight: 600; margin-bottom: 10px; color: #111; font-size: 14px;">
        Your Uploaded Reference Artwork (${referenceImageUrls.length}):
      </p>
      <div>
        ${referenceImageUrls
          .map(
            (url, idx) => `
          <div style="margin-bottom: 16px; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; max-width: 440px; background-color: #fafafa;">
            <a href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: block;">
              <img src="${url}" alt="Design Reference ${idx + 1}" style="width: 100%; max-height: 400px; object-fit: contain; display: block;" />
              <div style="padding: 10px 14px; font-size: 12px; color: #444; background: #ffffff; border-top: 1px solid #eee; display: block;">
                📎 View Full Resolution Image (${idx + 1})
              </div>
            </a>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

/**
 * Builds plain text reference link list
 */
function renderImagesPlainText(referenceImageUrls: string[]): string {
  if (!referenceImageUrls || referenceImageUrls.length === 0) {
    return '  None provided';
  }
  return referenceImageUrls
    .map((url, idx) => `  - Design Reference ${idx + 1}: ${url}`)
    .join('\n');
}

/**
 * Generates Subject, Plain Text, and HTML for the Client Booking Confirmation Email
 */
export function generateBookingConfirmationEmail(data: EmailTemplateData) {
  const {
    name,
    number,
    tattooLocation,
    appointmentDate,
    appointmentTime,
    referenceImageUrls = [],
  } = data;

  const subject = 'Appointment Booking Confirmation - Mulu Yu Kalam Studio';

  const text = `Dear ${name},

Thank you for choosing Mulu Yu Kalam Studio! We have received your tattoo appointment request and our team is currently reviewing your details.

YOUR BOOKING SUMMARY
--------------------
Placement Area: ${tattooLocation}
Preferred Date: ${appointmentDate}
Preferred Time: ${appointmentTime}
Phone Number: ${number}

UPLOADED REFERENCE ARTWORK
--------------------------
${renderImagesPlainText(referenceImageUrls)}

WHAT HAPPENS NEXT?
------------------
Our artists will review your selected schedule and reference ideas. We will reach out via Phone or WhatsApp shortly to confirm your booking and address any design details or deposit inquiries.

If you need to make changes or have questions, feel free to reply directly to contact@muluyukalam.com.np.

Best regards,
Mulu Yu Kalam Studio Team
contact@muluyukalam.com.np
`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222; line-height: 1.6; padding: 24px; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px;">
      <h2 style="color: #111; margin-top: 0; margin-bottom: 16px; font-size: 22px; border-bottom: 2px solid #111; padding-bottom: 8px;">
        Appointment Request Received 🎨
      </h2>

      <p style="font-size: 15px; margin-bottom: 16px;">
        Dear <strong>${name}</strong>,
      </p>

      <p style="font-size: 15px; margin-bottom: 22px;">
        Thank you for choosing <strong>Mulu Yu Kalam Studio</strong>! We have received your booking request and our artists are currently reviewing your design ideas.
      </p>

      <div style="background-color: #f7f7f7; border-left: 4px solid #111; padding: 16px 20px; border-radius: 4px; margin-bottom: 24px;">
        <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 15px; color: #111; text-transform: uppercase; letter-spacing: 0.5px;">
          Your Booking Summary
        </h3>

        <p style="margin: 6px 0; font-size: 14px;"><strong>Placement Area:</strong> ${tattooLocation}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Preferred Date:</strong> ${appointmentDate}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Preferred Time:</strong> ${appointmentTime}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Contact Phone:</strong> ${number}</p>
      </div>

      <div style="margin-bottom: 24px;">
        ${renderImagesHtml(referenceImageUrls)}
      </div>

      <div style="background-color: #f0f7ff; border: 1px solid #cce3ff; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
        <h4 style="margin: 0 0 6px 0; color: #0052cc; font-size: 15px;">What happens next?</h4>
        <p style="margin: 0; font-size: 14px; color: #333;">
          We will review your design ideas and confirm your appointment slot. Our studio team will reach out via Phone or WhatsApp shortly.
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />

      <p style="margin-bottom: 4px; font-size: 15px;">Best regards,</p>
      <p style="margin-top: 0; font-weight: 600; color: #111; margin-bottom: 2px;">Mulu Yu Kalam Studio Team</p>
      <p style="margin-top: 0; font-size: 13px; color: #666;">
        <a href="mailto:contact@muluyukalam.com.np" style="color: #666; text-decoration: underline;">contact@muluyukalam.com.np</a>
      </p>
    </div>
  `;

  return { subject, text, html };
}
