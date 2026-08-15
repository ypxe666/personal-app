'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Modal from './components/ui/Modal';
import { Settings, ArrowRight, Copy, CheckCircle2, ShieldCheck, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [groupId, setGroupId] = useState('');
  const [threadId, setThreadId] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // State untuk mengontrol buka/tutup accordion masing-masing panduan
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isIdGuideOpen, setIsIdGuideOpen] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) {
      setError('ID Group Telegram wajib diisi!');
      return;
    }

    setError('');
    const baseUrl = window.location.origin;
    let targetUrl = `${baseUrl}/report?groupId=${encodeURIComponent(groupId)}`;
    if (threadId) {
      targetUrl += `&threadId=${encodeURIComponent(threadId)}`;
    }

    setGeneratedUrl(targetUrl);
    setIsModalOpen(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-transparent text-slate-100 italic">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col justify-center items-center">
        <div className="w-full max-w-md glass-card glass-card-hover rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Accent Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white italic font-bold-title">Konfigurasi Grup</h1>
              <p className="text-xs text-slate-400 italic">Atur ID Telegram & tautan laporan</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl italic animate-pop-in">
              {error}
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold mb-2 text-slate-300 italic uppercase tracking-wider">
                ID Group Telegram <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="-100123456789"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 text-slate-950 placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 font-semibold italic transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 text-slate-300 italic uppercase tracking-wider">
                ID Thread / Topic (Opsional)
              </label>
              <input
                type="text"
                placeholder="1234 (Jika ada topik)"
                value={threadId}
                onChange={(e) => setThreadId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 text-slate-950 placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 font-semibold italic transition-all shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-[0.98] italic font-bold-title"
            >
              Generate Link Laporan
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Bagian Panduan Terpisah Menjadi 2 Accordion */}
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
            
            {/* Accordion 1: Cara Generate Link Laporan */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
              <button
                type="button"
                onClick={() => setIsGuideOpen(!isGuideOpen)}
                className="w-full flex items-center justify-between p-3.5 text-left text-xs text-sky-400 font-bold italic hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>CARA GENERATE LINK LAPORAN</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} />
              </button>

              {isGuideOpen && (
                <div className="p-3.5 pt-0 text-xs text-slate-400 space-y-2 italic border-t border-slate-800/60 mt-1">
                  <ol className="list-decimal list-inside space-y-1.5 pt-2">
                    <li>Tambahkan bot <strong className="text-slate-300">@ypxe_bot</strong> ke grup Telegram Anda.</li>
                    <li>Masukkan ID Group Telegram tempat Bot diaktifkan.</li>
                    <li>Jika memakai Fitur Topik/Thread, sertakan ID Thread.</li>
                    <li>Klik tombol Generate untuk memperoleh link khusus grup Anda.</li>
                  </ol>
                  <p className="text-slate-400 pt-1">
                    Pastikan semua data di atas sudah benar, lalu klik tombol <strong className="text-slate-300">Generate</strong>. Sistem akan membuatkan tautan khusus yang siap Anda gunakan untuk integrasi grup.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 2: Cara Mendapatkan ID Grup & Topik */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
              <button
                type="button"
                onClick={() => setIsIdGuideOpen(!isIdGuideOpen)}
                className="w-full flex items-center justify-between p-3.5 text-left text-xs text-sky-400 font-bold italic hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>CARA MENDAPATKAN ID GRUP & TOPIK</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isIdGuideOpen ? 'rotate-180' : ''}`} />
              </button>

              {isIdGuideOpen && (
                <div className="p-3.5 pt-0 text-xs text-slate-400 space-y-2 italic border-t border-slate-800/60 mt-1">
                  <p className="pt-2">
                    Buka grup Telegram melalui <strong className="text-slate-300">Telegram Web</strong> atau klik kanan pada pesan di aplikasi lalu pilih <strong className="text-slate-300">"Copy Post Link"</strong> (Salin Tautan Pesan).
                  </p>
                  <p>
                    Perhatikan struktur link yang tersalin di catatan Anda. Contoh format link:{' '}
                    <span className="text-indigo-50">https://t.me/c/</span>
                    <span className="text-amber-400">1234567890</span> / <span className="text-emerald-400">55</span>
                  </p>
                  <p>
                    Ambil deretan angka pertama (setelah huruf <code className="text-sky-400">/c/</code>) dan tambahkan <code className="text-sky-400">-100</code> di depannya untuk dijadikan <strong className="text-slate-300">ID Grup</strong> (<span className="text-amber-400 font-mono">-1001234567890</span>).
                  </p>
                  <p>
                    Dan (<span className="text-emerald-400">55</span>) adalah ID Topik/Thread.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Pop Up Hasil Generate */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Link Laporan Siap Digunakan">
        <div className="space-y-4 italic">
          <p className="text-sm text-slate-300">
            Salin atau buka link di bawah ini untuk menuju halaman input Laporan Piket:
          </p>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl break-all text-sky-400 text-xs font-mono select-all">
            {generatedUrl}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-slate-700 italic"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin!' : 'Copy Link'}
            </button>
            <button
              onClick={() => router.push(generatedUrl)}
              className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-sky-500/20 italic"
            >
              Buka Form
            </button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}