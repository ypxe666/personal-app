import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Appiket',
  description: 'ypxe.dev - Aplikasi Laporan Piket Telegram',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen h-full relative">
        {/* Overlay gelap transparan - dikurangi agar tidak terlalu gelap */}
        <div className="absolute inset-0 bg-black/75 pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}