interface FooterProps {
  copyrightText?: string;
}

export function Footer({ copyrightText }: FooterProps) {
  const currentYear = new Date().getFullYear().toString();
  const text = (
    copyrightText ||
    'Copyright © {year} Mulu Yu Kalam. All rights reserved.'
  ).replace('{year}', currentYear);

  return (
    <footer className="w-full bg-[#ff7b01] text-white py-6 px-4 ">
      <div className="  flex  items-center justify-center  ">
        <p className="text-sm font-medium ">{text}</p>
      </div>
    </footer>
  );
}
