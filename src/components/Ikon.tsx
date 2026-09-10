type Props = { className?: string };

/**
 * Ikon digambar sendiri dan hanya ada untuk hal yang butuh penanda cepat di
 * layar kecil. Tidak memakai satu set ikon garis tipis seragam.
 */

export function IkonWhatsApp({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.3A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.1 14.9l-.4-.2-2.6.6.7-2.5-.2-.4A8 8 0 0 1 12 4Zm-3 4c-.3 0-.7.1-1 .5-.4.4-.9 1-.9 2s.9 2.1 1 2.3c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.6.7 3 .6.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4l-.7-.4-1.6-.7c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.1-.2 0-.4.1-.5l.5-.6c.1-.2.2-.3.3-.5v-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4H9Z" />
    </svg>
  );
}

export function IkonUnduh({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4" />
      <path d="M4 19h16" />
    </svg>
  );
}

export function IkonSalin({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 5H6a2 2 0 0 0-2 2v9" />
    </svg>
  );
}

export function IkonCentang({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}

export function IkonKalender({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function IkonLokasi({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function IkonBeranda({ className, aktif }: Props & { aktif?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className={className} fill={aktif ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1Z" />
    </svg>
  );
}

export function IkonKabar({ className, aktif }: Props & { aktif?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className={className} fill={aktif ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M7 9h6M7 13h10M7 16h7" stroke={aktif ? "var(--color-paper)" : "currentColor"} strokeLinecap="round" />
    </svg>
  );
}

export function IkonAcaraNav({ className, aktif }: Props & { aktif?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className={className} fill={aktif ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <rect x="3.5" y="5.5" width="17" height="14" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5v4M16 3.5v4" strokeLinecap="round" />
      {aktif ? <circle cx="12" cy="14.5" r="1.6" fill="var(--color-paper)" stroke="none" /> : null}
    </svg>
  );
}

export function IkonTentang({ className, aktif }: Props & { aktif?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className={className} fill={aktif ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8.5" r="3.4" />
      <path d="M4.8 20c.7-3.6 3.6-5.6 7.2-5.6s6.5 2 7.2 5.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function IkonBagikan({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v11" />
      <path d="m8 8 4-4 4 4" />
      <path d="M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6" />
    </svg>
  );
}

export function IkonInstagram({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={className} fill="currentColor">
      <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm9.15 1.85a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 6.9a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2Zm0 2a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Z" />
    </svg>
  );
}

export function IkonTikTok({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={className} fill="currentColor">
      <path d="M13.2 2h2.6c.2 1.3.8 2.4 1.8 3.2.8.7 1.8 1.1 2.9 1.2v2.7a7.9 7.9 0 0 1-4.5-1.5v6.6a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.1v2.8a3.1 3.1 0 1 0 2.2 3V2Z" />
    </svg>
  );
}

/** Satu sosok jamaah dalam kotak 20x20: kepala bulat dan bahu, tinta padat. */
const SOSOK =
  "M10 .8a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6Zm0 9.6c5 0 8.5 2.9 9.3 8.1a.9.9 0 0 1-.9 1.1H1.6a.9.9 0 0 1-.9-1.1c.8-5.2 4.3-8.1 9.3-8.1Z";

const LEBAR_IKON = 108;
const TINGGI_IKON = 44;
const SISI_SOSOK = 20;
const SELA = 2;

/**
 * Ikon yang menggambarkan datanya sendiri: sebanyak paket, sebanyak sosok
 * jamaah. Satu sosok diulang, bukan empat lambang berbeda, jadi keempat kartu
 * pilihan paket adalah satu gambar yang sama dengan jumlah yang berbeda.
 *
 * Lima sosok per baris. Sepuluh sosok dalam satu baris jadi terlalu kecil di
 * kartu selebar 136px dan berubah jadi tekstur yang harus dihitung satu per
 * satu; dua baris lima terbaca dua kali lipat massa tintanya sekali lihat.
 *
 * Tidak ada nilai acak sama sekali di dalam sini. Posisi yang diacak akan
 * berbeda antara gambar dari server dan gambar di peramban, dan itu memicu
 * ketidakcocokan saat React menghidrasi halaman.
 */
export function IkonPaket({
  jumlah,
  tambah,
  className,
}: Props & { jumlah: number; tambah?: boolean }) {
  const skala = jumlah === 1 ? 2 : 1;
  const sisi = SISI_SOSOK * skala;
  const perBaris = Math.min(jumlah, 5);
  const barisan = Math.ceil(jumlah / 5);
  const lebarBaris = perBaris * sisi + (perBaris - 1) * SELA;
  const tinggiSusunan = barisan * sisi + (barisan - 1) * SELA;
  // Sosok digeser ke kiri kalau ada tanda tambah, supaya keduanya muat.
  const mulaiX = tambah ? 4 : (LEBAR_IKON - lebarBaris) / 2;
  const mulaiY = (TINGGI_IKON - tinggiSusunan) / 2;

  return (
    <svg
      viewBox={`0 0 ${LEBAR_IKON} ${TINGGI_IKON}`}
      width={LEBAR_IKON}
      height={TINGGI_IKON}
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      {Array.from({ length: jumlah }, (_, urutan) => {
        const kolom = urutan % 5;
        const baris = Math.floor(urutan / 5);
        return (
          <path
            key={urutan}
            d={SOSOK}
            transform={`translate(${mulaiX + kolom * (sisi + SELA)} ${mulaiY + baris * (sisi + SELA)}) scale(${skala})`}
          />
        );
      })}
      {tambah ? <path d="M84 15h7v7h7v7h-7v7h-7v-7h-7v-7h7z" /> : null}
    </svg>
  );
}
