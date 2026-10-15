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

export interface NotificationEmailProps {
  name?: string;
  email?: string;
  number?: string;
  tattooLocation?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  notes?: string | null;
  referenceImageUrls?: string[];
  submissionTime?: string;
}

export default function NotificationEmail({
  name = mockBookingData.name,
  email = mockBookingData.email,
  number = mockBookingData.number,
  tattooLocation = mockBookingData.tattooLocation,
  appointmentDate = mockBookingData.appointmentDate,
  appointmentTime = mockBookingData.appointmentTime,
  notes = mockBookingData.notes,
  referenceImageUrls = mockBookingData.referenceImageUrls,
  submissionTime = mockBookingData.submissionTime,
}: NotificationEmailProps) {
  return (
    <Html lang="en">
      <Tailwind config={emailThemeConfig}>
        <Head />
        <Preview>
          New Studio Booking: {name} ({tattooLocation} &bull; {appointmentDate})
        </Preview>
        <Body className="bg-[#faf7f2] font-sans py-10 px-4 text-[#171717]">
          <Container className="max-w-[580px] mx-auto bg-white rounded-3xl overflow-hidden border border-solid border-gray-200/80 shadow-lg">
            {/* Header / Admin Alert Badge (Clean Ink Charcoal with Gold Eyebrow) */}
            <Section className="bg-[#171717] py-8 px-6 text-center text-white">
              <Text className="text-[11px] font-bold tracking-[3px] text-[#ffbd5b] uppercase m-0">
                Studio Management Alert
              </Text>
              <Heading
                as="h1"
                className="text-2xl font-extrabold text-white mt-2 mb-1 tracking-tight"
              >
                New Booking Received
              </Heading>
              <Text className="text-xs text-white/75 m-0">
                Submitted via muluyukalam.com.np &bull; {submissionTime}
              </Text>
            </Section>

            {/* Main Content Area */}
            <Section className="p-8">
              <Text className="text-sm text-gray-700 leading-relaxed mt-0 mb-6">
                A new client tattoo consultation request has been recorded in
                the database. Please review the details and artwork below to
                confirm the session or reach out to the client.
              </Text>

              {/* Client Profile Card */}
              <Section className="bg-[#faf7f2] rounded-2xl p-5 border border-solid border-[#e8dfd1] mb-6">
                <Text className="text-xs font-bold uppercase tracking-wider text-[#ff7b01] m-0 mb-3 pb-2 ">
                  Client & Session Details
                </Text>

                <Row className="mb-2.5">
                  <Column className="w-1/3">
                    <Text className="text-xs text-gray-500 font-semibold m-0">
                      Client Name
                    </Text>
                  </Column>
                  <Column className="w-2/3">
                    <Text className="text-xs font-bold text-[#171717] m-0">
                      {name}
                    </Text>
                  </Column>
                </Row>

                <Row className="mb-2.5">
                  <Column className="w-1/3">
                    <Text className="text-xs text-gray-500 font-semibold m-0">
                      Email
                    </Text>
                  </Column>
                  <Column className="w-2/3">
                    <Link
                      href={`mailto:${email}`}
                      className="text-xs font-bold text-[#ff7b01] underline m-0"
                    >
                      {email}
                    </Link>
                  </Column>
                </Row>

                <Row className="mb-2.5">
                  <Column className="w-1/3">
                    <Text className="text-xs text-gray-500 font-semibold m-0">
                      Phone
                    </Text>
                  </Column>
                  <Column className="w-2/3">
                    <Link
                      href={`tel:${number}`}
                      className="text-xs font-bold text-[#ff7b01] underline m-0"
                    >
                      {number}
                    </Link>
                  </Column>
                </Row>

                <Row className="mb-2.5">
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

                <Row className="mb-2.5">
                  <Column className="w-1/3">
                    <Text className="text-xs text-gray-500 font-semibold m-0">
                      Requested Date
                    </Text>
                  </Column>
                  <Column className="w-2/3">
                    <Text className="text-xs font-bold text-[#171717] m-0">
                      {appointmentDate}
                    </Text>
                  </Column>
                </Row>

                <Row className="mb-2.5">
                  <Column className="w-1/3">
                    <Text className="text-xs text-gray-500 font-semibold m-0">
                      Requested Time
                    </Text>
                  </Column>
                  <Column className="w-2/3">
                    <Text className="text-xs font-bold text-[#171717] m-0">
                      {appointmentTime}
                    </Text>
                  </Column>
                </Row>

                {notes ? (
                  <Row className="mt-3 pt-3 border-none border-t border-solid border-black/5">
                    <Column className="w-full">
                      <Text className="text-xs text-gray-500 font-semibold m-0 mb-1">
                        Client Notes
                      </Text>
                      <Text className="text-xs text-gray-800 italic m-0 ">
                        &ldquo;{notes}&rdquo;
                      </Text>
                    </Column>
                  </Row>
                ) : null}
              </Section>

              {/* Reference Artwork Gallery (if present) */}
              {referenceImageUrls && referenceImageUrls.length > 0 ? (
                <Section className="mb-6">
                  <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 m-0 mb-3">
                    Submitted Reference Artwork ({referenceImageUrls.length})
                  </Text>
                  {referenceImageUrls.map((url, idx) => (
                    <Section
                      key={url}
                      className="mb-4 bg-[#faf7f2] rounded-2xl overflow-hidden border border-solid border-gray-200 text-center p-3"
                    >
                      <Link
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Img
                          src={url}
                          alt={`Reference Design ${idx + 1}`}
                          className="w-full max-h-[320px] object-contain mx-auto rounded-xl"
                        />
                      </Link>
                      <Text className="text-[11px] text-[#ff7b01] font-semibold mt-2 mb-0">
                        <Link
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ff7b01] underline"
                        >
                          Open Full Resolution Design #{idx + 1} &rarr;
                        </Link>
                      </Text>
                    </Section>
                  ))}
                </Section>
              ) : null}

              {/* Quick Admin Actions Box */}
              <Section className="bg-[#faf7f2] rounded-2xl p-5 border border-solid border-[#e8dfd1] text-center mb-6">
                <Heading
                  as="h3"
                  className="text-xs font-bold uppercase tracking-wider text-[#171717] m-0 mb-3"
                >
                  Staff Quick Actions
                </Heading>
                <Button
                  href="https://muluyukalam.com.np/admin"
                  className="bg-[#ff7b01] hover:bg-[#e65c00] text-white text-xs font-bold py-3 px-6 rounded-xl no-underline inline-block box-border text-center shadow-md shadow-[#ff7b01]/25 transition-colors"
                >
                  Open Studio Admin Dashboard
                </Button>
              </Section>

              <Hr className="border-solid border-gray-200 my-6" />

              <Text className="text-xs text-gray-400 m-0 text-center">
                Mulu Yu Kalam Internal System Notification &bull; Generated
                automatically
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-50 py-4 px-6 text-center border-none border-t border-solid border-gray-100">
              <Text className="text-[11px] text-gray-400 m-0">
                &copy; {new Date().getFullYear()} Mulu Yu Kalam Studio.
                Confidential internal record.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

NotificationEmail.PreviewProps =
  mockBookingData satisfies NotificationEmailProps;

export { NotificationEmail };
