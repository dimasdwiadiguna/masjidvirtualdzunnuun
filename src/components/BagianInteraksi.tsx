import Kuis from "@/components/Kuis";
import Polling from "@/components/Polling";

import { hasilPollingTerkini, pengaturanPublik } from "@/lib/cache";
import { db } from "@/lib/data";
import { JUMLAH_SOAL, bacaBankSoal, susunKuis, tandaPercobaan } from "@/lib/kuis";
import { KUKI_POLLING, bacaKodeHasil } from "@/lib/kuki-hasil";

/**
 * Bagian kuis atau polling di bagian bawah beranda.
 *
 * Modenya dipilih pengurus. Saat mati, atau saat isinya belum lengkap, bagian
 * ini tidak dirender sama sekali daripada muncul sebagai kotak kosong.
 */
export default async function BagianInteraksi() {
  let pengaturan;
  try {
    pengaturan = await pengaturanPublik();
  } catch {
    return null;
  }

  if (pengaturan.interaksi_mode === "kuis") {
    const { soal } = bacaBankSoal(pengaturan.kuis_bank);
    if (soal.length < JUMLAH_SOAL) return null;

    // Benih baru tiap render, ditandatangani bersama waktunya. Server menyusun
    // ulang soal yang sama dari benih itu saat menilai.
    const benih = Math.floor(Math.random() * 2_000_000_000);
    const waktu = Date.now();
    const { tampil } = susunKuis(pengaturan.kuis_bank, benih);

    return (
      <section className="kolom-lebar mt-8">
        <div className="judul-bagian">
          <h2>Kuis berhadiah</h2>
        </div>
        <p className="mt-2 text-[0.95rem] text-ink-soft">
          Tujuh soal, diacak tiap kali dibuka. Benar semua berhak hadiah khusus dari pengurus.
        </p>
        <div className="mt-3">
          <Kuis soal={tampil} benih={benih} waktu={waktu} tanda={await tandaPercobaan(benih, waktu)} />
        </div>
      </section>
    );
  }

  if (pengaturan.interaksi_mode === "polling") {
    const pilihan = pengaturan.polling_pilihan
      .split("\n")
      .map((baris) => baris.trim())
      .filter(Boolean);
    if (!pengaturan.polling_pertanyaan.trim() || pilihan.length < 2) return null;

    const [hasil, penanda] = await Promise.all([
      hasilPollingTerkini(pengaturan.polling_kunci, pilihan.length),
      bacaKodeHasil(KUKI_POLLING),
    ]);
    const sudahMemilih = penanda
      ? await (await db()).sudahMemilih(pengaturan.polling_kunci, penanda)
      : false;

    return (
      <section className="kolom-lebar mt-8">
        <div className="judul-bagian">
          <h2>Pendapat jamaah</h2>
        </div>
        <div className="mt-3">
          <Polling
            pertanyaan={pengaturan.polling_pertanyaan}
            pilihan={pilihan}
            hasil={hasil}
            sudahMemilih={sudahMemilih}
          />
        </div>
      </section>
    );
  }

  return null;
}
