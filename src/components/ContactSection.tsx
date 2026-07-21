import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { AppointmentForm } from "./AppointmentForm";

export const ContactSection: React.FC = () => {
  return (
    <section
      id="contact"
      className="py-20 lg:py-28 bg-[#ffdca9] rounded-t-[32px] md:rounded-t-[48px] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left Column: Heading, contact list, and pattern */}
          <div className="lg:col-span-5 space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2e0249] leading-[1.25] tracking-tight">
              Let’s discuss something{" "}
              <span className="text-[#ff7b01]">cool & ink</span> together
            </h2>

            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:SaulDesign@gmail.com"
                  className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-[#ff7b01] hover:bg-[#ffbd5b]/40 transition-all duration-200 group bg-white/40"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#ffecd0] text-[#ff7b01] flex items-center justify-center transition-transform group-hover:scale-110">
                    <Mail className="w-6 h-6" />
                  </div>
                  <span className="text-[#2e0249] font-bold text-base sm:text-lg">
                    SaulDesign@gmail.com
                  </span>
                </a>
              </li>

              <li>
                <a
                  href="tel:+123456789"
                  className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-[#ff7b01] hover:bg-[#ffbd5b]/40 transition-all duration-200 group bg-white/40"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#ffecd0] text-[#ff7b01] flex items-center justify-center transition-transform group-hover:scale-110">
                    <Phone className="w-6 h-6" />
                  </div>
                  <span className="text-[#2e0249] font-bold text-base sm:text-lg">
                    +123 456 789
                  </span>
                </a>
              </li>

              <li>
                <a
                  href="https://maps.app.goo.gl/HW5GvBYDiaNLx4rK6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-[#ff7b01] hover:bg-[#ffbd5b]/40 transition-all duration-200 group bg-white/40"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#ffecd0] text-[#ff7b01] flex items-center justify-center transition-transform group-hover:scale-110">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="text-[#2e0249] font-bold text-base sm:text-lg">
                    123 Street 456 House
                  </span>
                </a>
              </li>
            </ul>

            {/* Unalome spiritual symbol decoration */}
            <div className="pt-4 flex items-center">
              <div className="p-4 bg-white/50 rounded-2xl inline-block shadow-sm">
                <img
                  src="/assets/icons/unalome.svg"
                  alt="Unalome Symbol"
                  className="w-14 h-14 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Appointment Form */}
          <div className="lg:col-span-7">
            <AppointmentForm />
          </div>
        </div>
      </div>
    </section>
  );
};
