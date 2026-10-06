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
 * Builds HTML image components and links (strictly avoiding table tags)
 */
function renderImagesHtml(referenceImageUrls: string[]): string {
  if (!referenceImageUrls || referenceImageUrls.length === 0) {
    return `<p style="color: #666; font-style: italic; margin: 8px 0;">No reference artwork uploaded.</p>`;
  }

  return `
    <div style="margin-top: 15px;">
      <p style="font-weight: 600; margin-bottom: 10px; color: #111; font-size: 14px;">
        Reference Artwork (${referenceImageUrls.length}):
      </p>
      <div>
        ${referenceImageUrls
          .map(
            (url, idx) => `
          <div style="margin-bottom: 16px; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; max-width: 440px; background-color: #fafafa;">
            <a href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: block;">
              <img src="${url}" alt="Reference Artwork ${idx + 1}" style="width: 100%; max-height: 400px; object-fit: contain; display: block;" />
              <div style="padding: 10px 14px; font-size: 12px; color: #444; background: #ffffff; border-top: 1px solid #eee; display: block;">
                📎 Open Full Resolution Image (${idx + 1})
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
    .map((url, idx) => `  - Artwork ${idx + 1}: ${url}`)
    .join('\n');
}

/**
 * Generates Subject, Plain Text, and HTML for the Studio Notification Email
 */
export function generateNotificationEmail(data: EmailTemplateData) {
  const {
    name,
    email,
    number,
    tattooLocation,
    appointmentDate,
    appointmentTime,
    notes,
    referenceImageUrls = [],
    submissionTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kathmandu',
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  } = data;

  const safeNotes = notes && notes.trim().length > 0 ? notes.trim() : 'None provided';
  const subject = `Tattoo appointment book by ${name}`;

  const text = `Dear Team,

A new tattoo appointment booking has been submitted through the studio website.

CLIENT & APPOINTMENT DETAILS
----------------------------
Client Name: ${name}
Email Address: ${email}
Phone Number: ${number}
Tattoo Placement Area: ${tattooLocation}
Preferred Date: ${appointmentDate}
Preferred Time: ${appointmentTime}
Notes / Ideas: ${safeNotes}

REFERENCE ARTWORK
-----------------
${renderImagesPlainText(referenceImageUrls)}

Received at: ${submissionTime}

Best regards,
Mulu Yu Kalam Booking System
`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222; line-height: 1.6; padding: 24px; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px;">
      <h2 style="color: #111; margin-top: 0; margin-bottom: 16px; font-size: 22px; border-bottom: 2px solid #111; padding-bottom: 8px;">
        New Appointment Booking
      </h2>
      
      <p style="font-size: 15px; margin-bottom: 18px;">
        Dear Team,
      </p>

      <p style="font-size: 15px; margin-bottom: 22px;">
        A new tattoo appointment request has been submitted by <strong>${name}</strong> through the website booking system.
      </p>

      <div style="background-color: #f7f7f7; border-left: 4px solid #111; padding: 16px 20px; border-radius: 4px; margin-bottom: 24px;">
        <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 15px; color: #111; text-transform: uppercase; letter-spacing: 0.5px;">
          Booking Information
        </h3>

        <p style="margin: 6px 0; font-size: 14px;"><strong>Client Name:</strong> ${name}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0066cc;">${email}</a></p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${number}" style="color: #0066cc;">${number}</a></p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Placement:</strong> ${tattooLocation}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Preferred Date:</strong> ${appointmentDate}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Preferred Time:</strong> ${appointmentTime}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Notes / Ideas:</strong> ${safeNotes}</p>
      </div>

      <div style="margin-bottom: 24px;">
        ${renderImagesHtml(referenceImageUrls)}
      </div>

      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />

      <p style="margin-bottom: 4px; font-size: 15px;">Best regards,</p>
      <p style="margin-top: 0; font-weight: 600; color: #111;">Mulu Yu Kalam Booking System</p>

      <p style="font-size: 12px; color: #888; margin-top: 24px;">Received at ${submissionTime}</p>
    </div>
  `;

  return { subject, text, html };
}
