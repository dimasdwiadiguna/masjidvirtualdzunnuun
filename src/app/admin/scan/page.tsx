import type { Metadata } from "next";
import PapanCheckIn from "@/components/admin/PapanCheckIn";
import TambahPesertaManual, { type AcaraPilihan } from "@/components/admin/TambahPesertaManual";
import { db } from "@/lib/data";
import { sudahLewat } from "@/lib/format";

export const metadata: Metadata = { title: "Check-in", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminScan() {
  const semuaAcara = await (await db()).listEvents();

  /**
   * Acara yang belum selesai ditaruh di depan dan diurutkan dari yang paling
   * dekat, karena itu yang sedang dijaga panitia. Acara yang sudah lewat tetap
   * ada di bawahnya: kehadiran kadang baru sempat dicatat setelah acaranya
   * bubar.
   */
  const daftarAcara: AcaraPilihan[] = semuaAcara
    .map((acara) => ({
      id: acara.id,
      judul: acara.title,
      mulai: acara.starts_at,
      lewat: sudahLewat(acara.ends_at ?? acara.starts_at),
      berbayar: acara.is_paid,
      harga: acara.price,
    }))
    .sort((a, b) => {
      if (a.lewat !== b.lewat) return a.lewat ? 1 : -1;
      return a.lewat ? b.mulai.localeCompare(a.mulai) : a.mulai.localeCompare(b.mulai);
    });

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Check-in</h1>
      <p className="mt-1 text-ink-soft">
        Dua cara yang setara: ketik kodenya, atau pindai QR di tiket. Hasilnya muncul besar supaya terbaca sambil
        berdiri di pintu. Yang datang tanpa mendaftar bisa dicatat langsung di bagian paling bawah.
      </p>
      <PapanCheckIn />

      <section className="mt-8 border-t border-garis pt-6">
        <h2 className="text-[1.15rem]">Datang tanpa mendaftar</h2>
        <p className="mt-1 text-ink-soft">
          Catat namanya di sini. Tiketnya dibuat dan langsung ditandai hadir, jadi tidak perlu dipindai lagi.
        </p>
        <TambahPesertaManual daftarAcara={daftarAcara} />
      </section>
    </div>
  );
}
