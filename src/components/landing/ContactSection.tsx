import { ContactInformation } from './ContactInformation';
import { AppointmentForm } from '@/components/booking/AppointmentForm';

export function ContactSection() {
  return (
    <section
      id="contact"
      className="py-20 lg:py-28 bg-[#ffdca9] rounded-t-[32px] md:rounded-t-[48px] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left Column: Heading, contact list, and pattern */}
          <div className="order-2 md:order-1 md:col-span-5">
            <ContactInformation />
          </div>

          {/* Right Column: Appointment Form */}
          <div className="order-1 md:order-2 md:col-span-7">
            <h2 className=" md:hidden text-4xl sm:text-5xl font-extrabold text-[#2e0249] tracking-tight relative mb-12 pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-46 after:h-1 after:bg-[#ff7b01] after:rounded-full">
              Book An Appointment
            </h2>
            <AppointmentForm />
          </div>
        </div>
      </div>
    </section>
  );
}
