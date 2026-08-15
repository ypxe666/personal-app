import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const groupId = formData.get('groupId') as string;
    const threadId = formData.get('threadId') as string;
    const tanggal = formData.get('tanggal') as string;
    const jam = formData.get('jam') as string;
    const posisi = formData.get('posisi') as string;
    const membersRaw = formData.get('members') as string;
    const photos = formData.getAll('photos') as File[];

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json(
        { message: 'TELEGRAM_BOT_TOKEN belum dikonfigurasi di server.' },
        { status: 500 }
      );
    }

    const members = JSON.parse(membersRaw || '[]');

    // Format Pesan Teks
    let messageText = `📋 *LAPORAN PIKET*\n`;
    messageText += `📅 *HARI:* ${tanggal}\n`;
    messageText += `⏰ *JAM:* ${jam}\n`;
    messageText += `📍 *POSISI:* ${posisi}\n\n`;
    messageText += `👥 *ANGGOTA & JOBDESK:*\n`;
    
const numberIcons = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

members.forEach((m: { nama: string; jobdesk: string }, idx: number) => {
  const iconNum = numberIcons[idx] || `${idx + 1}.`;
  messageText += `${iconNum} *${m.nama}* : ${m.jobdesk}\n`;
});

    messageText += `\n`;
    messageText += `Link : [appiket](https://appiket.ypxe.dev)\n`;

    // 1. Jika ADA foto, kirim foto DENGAN Caption menyatu di pesan foto/album
    if (photos.length > 0) {
      if (photos.length === 1) {
        // Send Single Photo dengan Caption Teks
        const photoData = new FormData();
        photoData.append('chat_id', groupId);
        if (threadId) photoData.append('message_thread_id', threadId);
        photoData.append('photo', photos[0]);
        photoData.append('caption', messageText);
        photoData.append('parse_mode', 'Markdown');

        const photoRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          body: photoData,
        });

        if (!photoRes.ok) {
          const errData = await photoRes.json();
          throw new Error(errData.description || 'Gagal mengirim foto ke Telegram.');
        }
      } else {
        // Send Media Group (Album) dengan Caption pada foto pertama
        const mediaGroup = new FormData();
        mediaGroup.append('chat_id', groupId);
        if (threadId) mediaGroup.append('message_thread_id', threadId);

        const mediaArray: any[] = [];
        photos.forEach((photo, idx) => {
          const attachName = `photo_${idx}`;
          mediaGroup.append(attachName, photo);
          
          const mediaObj: any = {
            type: 'photo',
            media: `attach://${attachName}`,
          };
          
          // Masukkan caption pada elemen media pertama agar menyatu dengan album
          if (idx === 0) {
            mediaObj.caption = messageText;
            mediaObj.parse_mode = 'Markdown';
          }

          mediaArray.push(mediaObj);
        });

        mediaGroup.append('media', JSON.stringify(mediaArray));

        const albumRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMediaGroup`, {
          method: 'POST',
          body: mediaGroup,
        });

        if (!albumRes.ok) {
          const errData = await albumRes.json();
          throw new Error(errData.description || 'Gagal mengirim album foto ke Telegram.');
        }
      }
    } else {
      // 2. Jika TIDAK ada foto, kirim teks pesan biasa
      const textPayload: any = {
        chat_id: groupId,
        text: messageText,
        parse_mode: 'Markdown',
      };
      if (threadId) textPayload.message_thread_id = threadId;

      const textRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(textPayload),
      });

      if (!textRes.ok) {
        const errData = await textRes.json();
        throw new Error(errData.description || 'Gagal mengirim pesan ke Telegram.');
      }
    }

    return NextResponse.json({ success: true, message: 'Laporan berhasil dikirim' });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}