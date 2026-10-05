import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

interface ContactInformationProps {
  className?: string;
}

export function ContactInformation({
  className = '',
}: ContactInformationProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2e0249] leading-[1.25] tracking-tight">
        Let’s discuss something{' '}
        <span className="text-[#ff7b01]">cool & ink</span> together
      </h2>

      <ul className="space-y-4">
        <li>
          <a
            href="mailto:contact@muluyakalam.com.np"
            title="contact@muluyakalam.com.np"
            className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-[#ff7b01] hover:bg-[#ffbd5b]/40 transition-all duration-200 group bg-white/40 min-w-0"
          >
            <div className="w-12 h-12 rounded-xl bg-[#ffecd0] text-[#ff7b01] flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <span className="text-[#2e0249] font-bold text-base sm:text-lg truncate">
              contact@muluyakalam.com.np
            </span>
          </a>
        </li>

        <li>
          <a
            href="tel:+9779768404187"
            className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-[#ff7b01] hover:bg-[#ffbd5b]/40 transition-all duration-200 group bg-white/40 min-w-0"
          >
            <div className="w-12 h-12 rounded-xl bg-[#ffecd0] text-[#ff7b01] flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <span className="text-[#2e0249] font-bold text-base sm:text-lg truncate">
              +977 976-8404187
            </span>
          </a>
        </li>

        <li>
          <a
            href="https://maps.app.goo.gl/HW5GvBYDiaNLx4rK6"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-[#ff7b01] hover:bg-[#ffbd5b]/40 transition-all duration-200 group bg-white/40 min-w-0"
          >
            <div className="w-12 h-12 rounded-xl bg-[#ffecd0] text-[#ff7b01] flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-[#2e0249] font-bold text-base sm:text-lg ">
              Harisiddhi, LMC-29, Lalitpur
            </span>
          </a>
        </li>
      </ul>

      {/* Unalome spiritual symbol decoration */}
      <div className="pt-4 flex items-center">
        <div className="p-4 inline-block ">
          <Image
            src="/assets/img/Mulu-Yu-Kalam.svg"
            alt="Unalome Symbol"
            width={180}
            height={60}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
