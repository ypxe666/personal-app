'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Modal from '../components/ui/Modal';
import { Plus, Trash2, Send, Image as ImageIcon, Loader2, Calendar, Clock, MapPin, Users } from 'lucide-react';

interface MemberJob {
  nama: string;
  jobdesk: string;
}

const toCapitalizedCase = (str: string) => {
  return str.replace(/\b\w/g, (l) => l.toUpperCase());
};

function FormContent() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId') || '';
  const threadId = searchParams.get('threadId') || '';

  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [posisi, setPosisi] = useState('');
  const [members, setMembers] = useState<MemberJob[]>([{ nama: '', jobdesk: '' }]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    const now = new Date();
    const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    const months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

    setDateStr(`${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`);
    setTimeStr(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  }, []);

  const handleAddMember = () => {
    setMembers([...members, { nama: '', jobdesk: '' }]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof MemberJob, value: string) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (photos.length + filesArray.length > 5) {
        setModalMessage({ title: 'Batas Maksimal', body: 'Unggahan dibatasi maksimal 5 foto.' });
        return;
      }
      const newPhotos = [...photos, ...filesArray].slice(0, 5);
      setPhotos(newPhotos);
      setPhotoPreviews(newPhotos.map((file) => URL.createObjectURL(file)));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!groupId) {
      setModalMessage({ title: 'Error Konfigurasi', body: 'ID Group Telegram belum diisi pada URL.' });
      return;
    }

    setIsPreviewOpen(false);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('groupId', groupId);
      formData.append('threadId', threadId);
      formData.append('tanggal', toCapitalizedCase(dateStr));
      formData.append('jam', timeStr);
      formData.append('posisi', toCapitalizedCase(posisi));

      const formattedMembers = members.map(m => ({
        nama: toCapitalizedCase(m.nama),
        jobdesk: toCapitalizedCase(m.jobdesk)
      }));
      formData.append('members', JSON.stringify(formattedMembers));

      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const response = await fetch('/api/send-telegram', {
        method: 'POST',
        body: formData,
      });

      const resData = await response.json();

      if (response.ok) {
        setModalMessage({ title: 'Berhasil Terkirim!', body: 'Laporan piket dan foto telah dikirim secara terpadu ke Telegram.' });
        setPosisi('');
        setMembers([{ nama: '', jobdesk: '' }]);
        setPhotos([]);
        setPhotoPreviews([]);
      } else {
        throw new Error(resData.message || 'Gagal mengirim laporan.');
      }
    } catch (err: any) {
      setModalMessage({ title: 'Gagal Pengiriman', body: err.message || 'Terjadi kesalahan pada server.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full p-6 italic">
      <div className="glass-card rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 relative border border-slate-800">
        
        {/* Header Title */}
        <div className="border-b border-slate-800 pb-5 flex justify-between items-start flex-wrap gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-sky-400 italic font-bold-title">
              LAPORAN PIKET
            </h1>
            <div className="flex items-center gap-2 text-slate-400 text-xs mt-1 italic">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>({dateStr})</span>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setIsPreviewOpen(true); }} className="space-y-6">
          {/* Inputs: Jam & Posisi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 italic flex items-center gap-1.5 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-sky-400" /> Jam (Atur Manual)
              </label>
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-100 text-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 font-bold italic shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 italic flex items-center gap-1.5 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-sky-400" /> Posisi / Lokasi
              </label>
              <input
                type="text"
                placeholder="Contoh: Pos Otentikasi Utama"
                value={posisi}
                onChange={(e) => setPosisi(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-100 text-slate-950 placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 font-semibold italic shadow-inner"
              />
            </div>
          </div>

          {/* Vertical Stacking: Anggota & Jobdesk */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-300 italic flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-4 h-4 text-sky-400" /> Anggota & Jobdesk
            </label>

            {members.map((member, index) => (
              <div key={index} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 animate-pop-in">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-sky-400 italic">Anggota #{index + 1}</span>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 italic transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Nama Anggota"
                  value={member.nama}
                  onChange={(e) => handleMemberChange(index, 'nama', e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-100 text-slate-950 placeholder-slate-500 rounded-lg text-sm font-semibold italic shadow-inner"
                />
                <textarea
                  placeholder="Jobdesk yang Dikerjakan"
                  value={member.jobdesk}
                  onChange={(e) => handleMemberChange(index, 'jobdesk', e.target.value)}
                  required
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-100 text-slate-950 placeholder-slate-500 rounded-lg text-sm font-semibold italic shadow-inner"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddMember}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-sky-400 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 italic hover:border-sky-500/50"
            >
              <Plus className="w-4 h-4" /> Tambah Anggota & Jobdesk
            </button>
          </div>

          {/* Upload Foto */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 italic uppercase tracking-wider">
              Foto Piket (Maksimal 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={photos.length >= 5}
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className={`w-full border-2 border-dashed border-slate-700 hover:border-sky-400/80 bg-slate-950/40 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                photos.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ImageIcon className="w-8 h-8 text-sky-400 mb-2" />
              <span className="text-sm text-slate-300 font-semibold italic">
                Klik untuk unggah foto ({photos.length}/5)
              </span>
            </label>

            {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-700 animate-pop-in">
                    <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full p-1 text-xs hover:bg-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 italic font-bold-title"
          >
            Tinjau & Kirim Laporan
          </button>
        </form>
      </div>

      {/* Tinjau Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Tinjau Laporan Piket">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 italic">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-sm">
            <p><strong className="text-sky-400 italic">Tanggal:</strong> {toCapitalizedCase(dateStr)}</p>
            <p><strong className="text-sky-400 italic">Jam:</strong> {timeStr}</p>
            <p><strong className="text-sky-400 italic">Posisi:</strong> {toCapitalizedCase(posisi)}</p>
            <div>
              <strong className="text-sky-400 italic">Anggota & Jobdesk:</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-300">
                {members.map((m, idx) => (
                  <li key={idx}>
                    <span className="font-semibold text-white">{toCapitalizedCase(m.nama)}</span>: {toCapitalizedCase(m.jobdesk)}
                  </li>
                ))}
              </ul>
            </div>
            <p><strong className="text-sky-400 italic">Foto Terlampir:</strong> {photos.length} Gambar (akan dikirim menyatu)</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700 italic"
            >
              Edit
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 italic"
            >
              <Send className="w-4 h-4" /> Kirim
            </button>
          </div>
        </div>
      </Modal>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center gap-3 border border-slate-700 italic">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            <p className="text-white font-bold italic">Sedang Mengirim Laporan...</p>
          </div>
        </div>
      )}

      {/* Modal Notifikasi */}
      <Modal isOpen={!!modalMessage} onClose={() => setModalMessage(null)} title={modalMessage?.title || 'Notifikasi'}>
        <div className="space-y-4 italic">
          <p className="text-slate-300">{modalMessage?.body}</p>
          <button
            onClick={() => setModalMessage(null)}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl italic"
          >
            Tutup
          </button>
        </div>
      </Modal>
    </main>
  );
}

export default function ReportPage() {
  return (
    <div className="">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-sky-400 italic">Memuat Form...</div>}>
        <FormContent />
      </Suspense>
      <Footer />
    </div>
  );
}