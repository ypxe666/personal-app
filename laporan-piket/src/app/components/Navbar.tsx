import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2 text-sky-400 font-bold text-xl not-italic">
        <Image 
          src="/favicon.ico" 
          alt="APPIKET Logo" 
          width={24} 
          height={24} 
          className="w-6 h-6 object-contain"
        />
        <span className="bold text-white italic">APP-PIKET</span>
      </Link>
      <div className="text-sm text-slate-400 italic">
        appiket.ypxe.dev
      </div>
    </nav>
  );
}