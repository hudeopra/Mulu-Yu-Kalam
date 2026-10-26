import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-[#ff7b01] text-white py-6 px-4 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p className="text-sm font-medium tracking-wide">
          Copyright &copy; {new Date().getFullYear()} Mulu Yu Kalam. All rights
          reserved.
        </p>
        <div className="flex items-center gap-6 text-sm font-semibold">
          <Link href="/" className="hover:underline">
            Studio
          </Link>
          <Link href="/posts" className="hover:underline">
            Journal
          </Link>
          <Link href="/login" className="hover:underline opacity-90 hover:opacity-100">
            Staff Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
