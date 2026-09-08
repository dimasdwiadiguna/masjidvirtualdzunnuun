import type { Metadata } from "next";
import BannerTersimpan from "@/components/admin/BannerTersimpan";
import FormAksi from "@/components/admin/FormAksi";
import PilihMode from "@/components/admin/PilihMode";
import { db } from "@/lib/data";
import { angka } from "@/lib/format";
import { JUMLAH_SOAL, bacaBankSoal } from "@/lib/kuis";
import { simpanInteraksi } from "./actions";

export const metadata: Metadata = { title: "Kuis dan Polling", robots: { index: false } };
export const dynamic = "force-dynamic";

const CONTOH = `# Masjid tempat Dzun Nuun berkegiatan?
* Masjid Fathul Ummah
- Masjid Al-Ikhlas
- Masjid An-Nur

# Kegiatan rutin Dzun Nuun tiap Ahad pagi?
* Ngopi Subuh
- Futsal
- Rapat pengurus`;

type Props = { searchParams: Promise<{ tersimpan?: string }> };

export default async function AdminKuis({ searchParams }: Props) {
  const { tersimpan } = await searchParams;
  const data = await db();
  const [pengaturan, pemenangHariIni] = await Promise.all([
    data.getSettings(),
    data.hitungPemenangHariIni(),
  ]);
  const { soal, galat } = bacaBankSoal(pengaturan.kuis_bank);

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Kuis dan Polling</h1>
      <p className="mt-1 text-ink-soft">
        Satu bagian di bawah beranda. Pilih mau menampilkan kuis, polling, atau tidak sama sekali. Hanya satu yang
        tampil dalam satu waktu.
      </p>

      <BannerTersimpan tampil={Boolean(tersimpan)} />

      <div className="kartu mt-5 p-4">
        <h2 className="text-base">Keadaan sekarang</h2>
        <p className="petunjuk">
          Mode: <strong>{pengaturan.interaksi_mode}</strong>. Bank soal terbaca {angka(soal.length)} soal
          {galat.length > 0 ? `, dengan ${angka(galat.length)} masalah` : ""}. Pemenang kuis hari ini{" "}
          {angka(pemenangHariIni)} dari kuota {angka(pengaturan.kuis_kuota_harian)}.
        </p>
        {galat.length > 0 ? (
          <ul className="mt-2 grid gap-1 text-sm text-bahaya">
            {galat.map((satu) => (
              <li key={satu}>{satu}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <FormAksi aksi={simpanInteraksi} labelKirim="Simpan" className="mt-6 max-w-[640px]">
        <PilihMode awal={pengaturan.interaksi_mode} />

        <div>
          <label className="label-isian" htmlFor="kuis_bank">
            Bank soal kuis
          </label>
          <textarea
            id="kuis_bank"
            name="kuis_bank"
            rows={14}
            defaultValue={pengaturan.kuis_bank}
            className="isian font-[family-name:var(--font-isi)]"
            placeholder={CONTOH}
          />
          <p className="petunjuk">
            Satu soal per blok, dipisah baris kosong. Baris berawalan pagar adalah pertanyaan, bintang untuk jawaban
            benar, dan strip untuk jawaban salah. Contoh:
          </p>
          <pre className="mt-2 whitespace-pre-wrap rounded-[8px] bg-cream p-3 text-[0.85rem]">{CONTOH}</pre>
          <p className="petunjuk">
            Tiap kali kuis dibuka, {JUMLAH_SOAL} soal diambil acak dari sini dan urutan pilihannya ikut diacak. Jadi
            isi lebih dari {JUMLAH_SOAL} soal supaya tidak selalu sama.
          </p>
        </div>

        <div>
          <label className="label-isian" htmlFor="kuis_kuota_harian">
            Kuota pemenang per hari
          </label>
          <input
            id="kuis_kuota_harian"
            name="kuis_kuota_harian"
            type="number"
            min={1}
            defaultValue={pengaturan.kuis_kuota_harian}
            className="isian"
          />
          <p className="petunjuk">
            Satu nomor WhatsApp hanya bisa menang sekali per hari. Kuota habis, yang menjawab benar tetap diberi tahu
            dengan jujur bahwa kuota hari itu sudah penuh.
          </p>
        </div>

        <div>
          <label className="label-isian" htmlFor="polling_pertanyaan">
            Pertanyaan polling
          </label>
          <input
            id="polling_pertanyaan"
            name="polling_pertanyaan"
            maxLength={120}
            defaultValue={pengaturan.polling_pertanyaan}
            className="isian"
            placeholder="Kegiatan apa yang paling Anda tunggu bulan ini?"
          />
        </div>

        <div>
          <label className="label-isian" htmlFor="polling_pilihan">
            Pilihan jawaban polling
          </label>
          <textarea
            id="polling_pilihan"
            name="polling_pilihan"
            rows={5}
            defaultValue={pengaturan.polling_pilihan}
            className="isian"
            placeholder={"Ngopi Subuh\nKajian Ahad\nKelas Tahsin"}
          />
          <p className="petunjuk">
            Satu pilihan per baris, minimal dua. Mengubah pertanyaan atau pilihannya akan memulai perhitungan suara
            dari nol, supaya jawaban lama tidak tercampur ke pertanyaan baru.
          </p>
        </div>
      </FormAksi>
    </div>
  );
}
