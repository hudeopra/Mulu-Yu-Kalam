import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '@/types/landing';

interface ContactInformationProps {
  className?: string;
  settings?: SiteSettings;
}

export function ContactInformation({
  className = '',
  settings = DEFAULT_SITE_SETTINGS,
}: ContactInformationProps) {
  const email = settings.email || DEFAULT_SITE_SETTINGS.email;
  const phone = settings.phone || DEFAULT_SITE_SETTINGS.phone;
  const address = settings.address || DEFAULT_SITE_SETTINGS.address;
  const mapsUrl = settings.maps_url || DEFAULT_SITE_SETTINGS.maps_url;
  const logoUrl = settings.logo_url || DEFAULT_SITE_SETTINGS.logo_url;

  return (
    <div className={`space-y-8 ${className}`}>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2e0249] leading-[1.25] tracking-tight">
        Let’s discuss something{' '}
        <span className="text-[#ff7b01]">cool & ink</span> together
      </h2>

      <ul className="space-y-4">
        <li>
          <a
            href={`mailto:${email}`}
            title={email}
            className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-[#ff7b01] hover:bg-[#ffbd5b]/40 transition-all duration-200 group bg-white/40 min-w-0"
          >
            <div className="w-12 h-12 rounded-xl bg-[#ffecd0] text-[#ff7b01] flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <span className="text-[#2e0249] font-bold text-base sm:text-lg truncate">
              {email}
            </span>
          </a>
        </li>

        <li>
          <a
            href={`tel:${phone.replace(/\s+/g, '')}`}
            className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-[#ff7b01] hover:bg-[#ffbd5b]/40 transition-all duration-200 group bg-white/40 min-w-0"
          >
            <div className="w-12 h-12 rounded-xl bg-[#ffecd0] text-[#ff7b01] flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <span className="text-[#2e0249] font-bold text-base sm:text-lg truncate">
              {phone}
            </span>
          </a>
        </li>

        <li>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-[#ff7b01] hover:bg-[#ffbd5b]/40 transition-all duration-200 group bg-white/40 min-w-0"
          >
            <div className="w-12 h-12 rounded-xl bg-[#ffecd0] text-[#ff7b01] flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-[#2e0249] font-bold text-base sm:text-lg ">
              {address}
            </span>
          </a>
        </li>
      </ul>

      {/* Unalome spiritual symbol decoration */}
      <div className="pt-4 w-[80%] min-w-70 flex items-center">
        <div className="p-4 inline-block ">
          <Image
            src={logoUrl}
            alt="Unalome Symbol"
            width={500}
            height={60}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
