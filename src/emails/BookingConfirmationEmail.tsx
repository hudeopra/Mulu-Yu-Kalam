import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Button,
  Link,
  Img,
  Hr,
  Tailwind,
  pixelBasedPreset,
} from 'react-email';
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  MapPinIcon,
} from '@/components/icons';
import { mockBookingData } from './mockData';

/**
 * Theme configuration mirroring variables from src/app/globals.css
 * --color-brand-primary:  #ff7b01
 * --color-brand-accent:   #ffbd5b
 * --color-brand-bg-cream: #ffdca9
 * --color-brand-dark:     #171717
 */
const emailThemeConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        brandPrimary: '#ff7b01',
        brandAccent: '#ffbd5b',
        brandCream: '#ffdca9',
        brandDark: '#171717',
        brandSurface: '#faf7f2',
        brandBorder: '#e8dfd1',
      },
    },
  },
};

export interface BookingConfirmationEmailProps {
  name?: string;
  email?: string;
  number?: string;
  tattooLocation?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  notes?: string | null;
  referenceImageUrls?: string[];
  logoUrl?: string;
}

export default function BookingConfirmationEmail({
  name = mockBookingData.name,
  number = mockBookingData.number,
  tattooLocation = mockBookingData.tattooLocation,
  appointmentDate = mockBookingData.appointmentDate,
  appointmentTime = mockBookingData.appointmentTime,
  notes = mockBookingData.notes,
  referenceImageUrls = mockBookingData.referenceImageUrls,
  logoUrl = "https://muluyukalam.com.np/assets/img/Mulu-Yu-Kalam.svg",
}: BookingConfirmationEmailProps) {
  return (
    <Html lang="en">
      <Tailwind config={emailThemeConfig}>
        <Head />
        <Preview>
          Your tattoo appointment request has been received — Mulu Yu Kalam
        </Preview>
        <Body className="bg-[#faf7f2] font-sans py-10 px-4 text-[#171717]">
          <Container className="max-w-[580px] mx-auto bg-white rounded-3xl overflow-hidden border border-solid border-gray-200/80 shadow-lg">
            {/* Studio Header Banner (Clean Ink Charcoal with Gold Eyebrow) */}
            <Section className="bg-[#171717] text-center py-8 px-6 text-white">
              <Text className="text-[11px] font-bold tracking-[3px] text-[#ffbd5b] uppercase m-0">
                Mulu Yu Kalam Tattoo Studio
              </Text>
              <Heading
                as="h1"
                className="text-2xl font-extrabold text-white mt-2 mb-1 tracking-tight"
              >
                Appointment Received
              </Heading>
              <Text className="text-xs text-white/75 m-0">
                Harisiddhi (Jala), Lalitpur, Nepal
              </Text>
            </Section>

            {/* Main Content Area */}
            <Section className="p-8">
              <Text className="text-base text-gray-800 leading-relaxed mt-0">
                Dear <strong>{name}</strong>,
              </Text>
              <Text className="text-sm text-gray-600 leading-relaxed mb-6">
                Thank you for choosing <strong>Mulu Yu Kalam</strong>! We have
                received your appointment request. Our artists are currently
                reviewing your design ideas and schedule.
              </Text>

              {/* Booking Summary Card */}
              <Section className="bg-[#faf7f2] rounded-2xl p-5 border border-solid border-[#e8dfd1] mb-6">
                <Text className="text-xs font-bold uppercase tracking-wider text-[#ff7b01] m-0 mb-3 pb-2 ">
                  Your Booking Summary
                </Text>

                <Row className="mb-2">
                  <Column className="w-1/3">
                    <Text className="text-xs text-gray-500 font-semibold m-0">
                      Placement
                    </Text>
                  </Column>
                  <Column className="w-2/3">
                    <Text className="text-xs font-bold text-[#171717] m-0">
                      {tattooLocation}
                    </Text>
                  </Column>
                </Row>

                <Row className="mb-2">
                  <Column className="w-1/3">
                    <Text className="text-xs text-gray-500 font-semibold m-0">
                      Preferred Date
                    </Text>
                  </Column>
                  <Column className="w-2/3">
                    <Text className="text-xs font-bold text-[#171717] m-0">
                      {appointmentDate}
                    </Text>
                  </Column>
                </Row>

                <Row className="mb-2">
                  <Column className="w-1/3">
                    <Text className="text-xs text-gray-500 font-semibold m-0">
                      Preferred Time
                    </Text>
                  </Column>
                  <Column className="w-2/3">
                    <Text className="text-xs font-bold text-[#171717] m-0">
                      {appointmentTime}
                    </Text>
                  </Column>
                </Row>

                <Row className="mb-2">
                  <Column className="w-1/3">
                    <Text className="text-xs text-gray-500 font-semibold m-0">
                      Contact Phone
                    </Text>
                  </Column>
                  <Column className="w-2/3">
                    <Text className="text-xs font-bold text-[#171717] m-0">
                      {number}
                    </Text>
                  </Column>
                </Row>

                {notes ? (
                  <Row className="mt-3 pt-3 border-none border-t border-solid border-black/5">
                    <Column className="w-full">
                      <Text className="text-xs text-gray-500 font-semibold m-0 mb-1">
                        Design Notes
                      </Text>
                      <Text className="text-xs text-gray-700 italic m-0 bg-white p-3 rounded-xl border border-solid border-black/5">
                        &ldquo;{notes}&rdquo;
                      </Text>
                    </Column>
                  </Row>
                ) : null}
              </Section>

              {/* Uploaded Artwork Preview (if present) */}
              {referenceImageUrls && referenceImageUrls.length > 0 ? (
                <Section className="mb-6">
                  <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 m-0 mb-3">
                    Uploaded Reference Artwork ({referenceImageUrls.length})
                  </Text>
                  {referenceImageUrls.map((url, idx) => (
                    <Section
                      key={url}
                      className="mb-4 bg-[#faf7f2] rounded-2xl overflow-hidden border border-solid border-gray-200 text-center p-3 flex"
                    >
                      <Link
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Img
                          src={url}
                          alt={`Reference Design ${idx + 1}`}
                          className="w-full max-h-[300px] object-contain mx-auto rounded-xl"
                        />
                      </Link>
                      <Text className="text-[11px] text-[#ff7b01] font-semibold mt-2 mb-0">
                        <Link
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ff7b01] underline"
                        >
                          View Full Resolution Design #{idx + 1} &rarr;
                        </Link>
                      </Text>
                    </Section>
                  ))}
                </Section>
              ) : null}

              <Hr className=" my-6" />

              {/* Studio Sign-off */}
              <Text className="text-xs text-gray-500 m-0">Warm regards,</Text>
              <Text className="text-sm font-bold text-[#171717] m-0 mt-1">
                Mulu Yu Kalam Studio Team
              </Text>

              {/* Studio Logo */}
              <Section className="mt-4">
                <Img
                  src={logoUrl}
                  alt="Mulu Yu Kalam Tattoo Studio Logo"
                  width={190}
                  height={40}
                  className="w-[170px] h-auto object-contain"
                />
              </Section>
            </Section>
            {/* Studio Social Links & Google Maps Section */}
            <Section className="bg-[#faf7f2]  p-6 border border-solid border-[#e8dfd1] text-center mb-6">
              <Text className="text-[11px] font-bold uppercase tracking-[2px] text-[#ff7b01] m-0 mb-1">
                Connect & Visit Us
              </Text>
              <Heading
                as="h3"
                className="text-base font-bold text-[#171717] m-0 mb-4"
              >
                Follow Our Art & Find the Studio
              </Heading>

              {/* Social Channel Pills */}
              <Section className="text-center mb-3">
                <Row>
                  <Column align="center">
                    <Link
                      href="https://wa.me/9779861341995/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-[#171717] border border-solid border-[#e2d5c3] hover:border-[#ff7b01] hover:text-[#ff7b01] hover:bg-[#faf7f2] text-xs font-semibold py-2 px-3.5 rounded-xl no-underline inline-block mr-2 mb-2 shadow-xs transition-colors"
                    >
                      <WhatsAppIcon
                        width={14}
                        height={14}
                        className="inline-block align-middle mr-1.5 text-[#171717]"
                        style={{
                          display: 'inline-block',
                          verticalAlign: '-2px',
                          marginRight: '6px',
                        }}
                      />
                      WhatsApp
                    </Link>
                    <Link
                      href="https://www.instagram.com/mulu_yu_kalam/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-[#171717] border border-solid border-[#e2d5c3] hover:border-[#ff7b01] hover:text-[#ff7b01] hover:bg-[#faf7f2] text-xs font-semibold py-2 px-3.5 rounded-xl no-underline inline-block mr-2 mb-2 shadow-xs transition-colors"
                    >
                      <InstagramIcon
                        width={14}
                        height={14}
                        className="inline-block align-middle mr-1.5 text-[#171717]"
                        style={{
                          display: 'inline-block',
                          verticalAlign: '-2px',
                          marginRight: '6px',
                        }}
                      />
                      Instagram
                    </Link>
                    <Link
                      href="https://www.facebook.com/MuluYuKalam"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-[#171717] border border-solid border-[#e2d5c3] hover:border-[#ff7b01] hover:text-[#ff7b01] hover:bg-[#faf7f2] text-xs font-semibold py-2 px-3.5 rounded-xl no-underline inline-block mr-2 mb-2 shadow-xs transition-colors"
                    >
                      <FacebookIcon
                        width={14}
                        height={14}
                        className="inline-block align-middle mr-1.5 text-[#171717]"
                        style={{
                          display: 'inline-block',
                          verticalAlign: '-2px',
                          marginRight: '6px',
                        }}
                      />
                      Facebook
                    </Link>
                    <Link
                      href="https://www.tiktok.com/@mulu_yu_kalam"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-[#171717] border border-solid border-[#e2d5c3] hover:border-[#ff7b01] hover:text-[#ff7b01] hover:bg-[#faf7f2] text-xs font-semibold py-2 px-3.5 rounded-xl no-underline inline-block mb-2 shadow-xs transition-colors"
                    >
                      <TikTokIcon
                        width={14}
                        height={14}
                        className="inline-block align-middle mr-1.5 text-[#171717]"
                        style={{
                          display: 'inline-block',
                          verticalAlign: '-2px',
                          marginRight: '6px',
                        }}
                      />
                      TikTok
                    </Link>
                  </Column>
                </Row>
              </Section>

              {/* Google Maps Location CTA Button */}
              <Section className="text-center pt-3 border-none border-t border-solid border-[#e8dfd1]">
                <Button
                  href="https://maps.app.goo.gl/HW5GvBYDiaNLx4rK6"
                  className="bg-[#ff7b01] hover:bg-[#e65c00] text-white text-xs font-bold py-3 px-6 rounded-xl no-underline inline-block box-border text-center shadow-md shadow-[#ff7b01]/25 transition-colors"
                >
                  <MapPinIcon
                    width={15}
                    height={15}
                    stroke="currentColor"
                    className="inline-block align-middle mr-2 text-white"
                    style={{
                      display: 'inline-block',
                      verticalAlign: '-2px',
                      marginRight: '6px',
                    }}
                  />
                  Open Studio on Google Maps
                </Button>
                <Text className="text-[11px] text-gray-500 m-0 mt-2">
                  Harisiddhi (Jala), Lalitpur, Nepal
                </Text>
              </Section>
            </Section>
            {/* Footer */}
            <Section className="bg-gray-50 py-4 px-6 text-center border-none border-t border-solid border-gray-100">
              <Text className="text-[11px] text-gray-400 m-0">
                &copy; {new Date().getFullYear()} Mulu Yu Kalam Studio. All
                rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

BookingConfirmationEmail.PreviewProps =
  mockBookingData satisfies BookingConfirmationEmailProps;

export { BookingConfirmationEmail };
