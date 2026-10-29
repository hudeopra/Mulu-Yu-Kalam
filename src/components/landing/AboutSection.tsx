import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  MapPinIcon,
} from '@/components/icons';
import { AnimatedCounter } from './AnimatedCounter';
import {
  SiteAbout,
  SiteSettings,
  COUNTER_COLOR_MAP,
  DEFAULT_SITE_ABOUT,
  DEFAULT_SITE_SETTINGS,
} from '@/types/landing';

interface AboutSectionProps {
  aboutData?: SiteAbout;
  settings?: SiteSettings;
}

export function AboutSection({
  aboutData = DEFAULT_SITE_ABOUT,
  settings = DEFAULT_SITE_SETTINGS,
}: AboutSectionProps) {
  const whatsappUrl =
    settings.whatsapp_url || DEFAULT_SITE_SETTINGS.whatsapp_url;
  const instagramUrl =
    settings.instagram_url || DEFAULT_SITE_SETTINGS.instagram_url;
  const facebookUrl =
    settings.facebook_url || DEFAULT_SITE_SETTINGS.facebook_url;
  const tiktokUrl = settings.tiktok_url || DEFAULT_SITE_SETTINGS.tiktok_url;
  const mapsUrl = settings.maps_url || DEFAULT_SITE_SETTINGS.maps_url;

  const title = aboutData.title || DEFAULT_SITE_ABOUT.title;
  const p1 = aboutData.paragraph_1 || DEFAULT_SITE_ABOUT.paragraph_1;
  const p2 = aboutData.paragraph_2 || DEFAULT_SITE_ABOUT.paragraph_2;
  const counters =
    aboutData.counters && aboutData.counters.length > 0
      ? aboutData.counters
      : DEFAULT_SITE_ABOUT.counters;
  const notes =
    aboutData.notes && aboutData.notes.length > 0
      ? aboutData.notes
      : DEFAULT_SITE_ABOUT.notes;

  return (
    <section id="about" className="relative w-full bg-white overflow-hidden">
      {/* Top right floating social bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute right-4 sm:right-6 lg:right-8 -top-0 z-20">
          <ul className="flex items-center gap-5 sm:gap-6 bg-[#ff7b01] text-white py-4 sm:py-5 px-8 sm:px-12 rounded-b-2xl shadow-xl">
            <li>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="block text-white hover:text-[#ffbd5b] hover:scale-125 transition-all"
              >
                <WhatsAppIcon className="w-6 h-6" />
              </a>
            </li>
            <li>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="block text-white hover:text-[#ffbd5b] hover:scale-125 transition-all"
              >
                <InstagramIcon className="w-6 h-6" />
              </a>
            </li>
            <li>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="block text-white hover:text-[#ffbd5b] hover:scale-125 transition-all"
              >
                <FacebookIcon className="w-6 h-6" />
              </a>
            </li>
            <li>
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="block text-white hover:text-[#ffbd5b] hover:scale-125 transition-all"
              >
                <TikTokIcon className="w-6 h-6" />
              </a>
            </li>
            <li>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Google Maps Location"
                className="block text-white hover:text-[#ffbd5b] hover:scale-125 transition-all"
              >
                <MapPinIcon className="w-7 h-7" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Main About content container with background vector */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 lg:pt-48 lg:pb-76 bg-none lg:bg-[url('/assets/img/bg-img.svg')] bg-no-repeat bg-contain bg-size-[70%] bg-[center_112%]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 justify-between items-center">
          {/* Text content column */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2e0249] tracking-tight relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-34 after:h-1 after:bg-[#ff7b01] after:rounded-full">
                {title}
              </h2>
            </div>

            <div
              className="text-gray-700 leading-relaxed text-base [&_span]:inline"
              dangerouslySetInnerHTML={{ __html: p1 }}
            />

            <div
              className="text-gray-700 leading-relaxed text-sm sm:text-base [&_span]:inline"
              dangerouslySetInnerHTML={{ __html: p2 }}
            />

            <div className="flex lg:flex-col lg:w-8/12 gap-4 pt-1">
              {notes.slice(0, 2).map((note, idx) => (
                <div
                  key={idx}
                  className="bg-[#ffecd0]/50 p-4 rounded-xl border border-[#ffbd5b]/40"
                >
                  <h3 className="font-bold text-[#2e0249] text-base mb-1">
                    {note.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Counters Column */}
          <div className="lg:col-span-5 lg:col-start-9">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6">
              {counters.map((c, idx) => {
                const colorConfig =
                  COUNTER_COLOR_MAP[c.color] || COUNTER_COLOR_MAP.purple;
                return (
                  <AnimatedCounter
                    key={idx}
                    target={c.target}
                    label={c.label}
                    colorClass={colorConfig.text}
                    bgClass={colorConfig.bg}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
