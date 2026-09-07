import type { Metadata } from "next";
import Link from "next/link";
import { db, kredensialSupabaseAda, memakaiSupabase, memintaDriverLokal } from "@/lib/data";
import { alamatSitus } from "@/lib/situs";
import { denganBatasWaktu } from "@/lib/waktu";

export const metadata: Metadata = { title: "Diagnosa", robots: { index: false } };
export const dynamic = "force-dynamic";

type Hasil = { nama: string; keadaan: "baik" | "perhatian" | "gagal"; pesan: string };

/** Pesan asli tetap ditampilkan, ditambah terjemahan untuk penyebab yang sering muncul. */
function pesanGalat(galat: unknown): string {
  const asli = galat instanceof Error ? galat.message : "Galat yang tidak dikenali.";
  const petunjuk = [
    { cocok: /fetch failed|ENOTFOUND|ECONNREFUSED/i, arti: "Alamat project Supabase tidak bisa dihubungi. Periksa NEXT_PUBLIC_SUPABASE_URL, harus berbentuk https://xxxx.supabase.co." },
    { cocok: /invalid api key|JWT|api key/i, arti: "Kunci yang dipakai ditolak Supabase. Pastikan yang diisi service_role key, bukan anon key." },
    { cocok: /does not exist|schema cache|relation/i, arti: "Tabelnya belum ada. Jalankan supabase/schema.sql lalu supabase/seed.sql di SQL Editor Supabase." },
    { cocok: /Tidak ada jawaban dalam/i, arti: "Supabase tidak menjawab tepat waktu. Periksa apakah project-nya sedang dijeda." },
  ].find((p) => p.cocok.test(asli));
  return petunjuk ? `${petunjuk.arti} Pesan asli: ${asli}` : asli;
}

/**
 * Setiap pemeriksaan dibatasi waktunya dan dijalankan berbarengan. Kalau
 * databasenya tidak menjawab, halaman ini justru yang paling dibutuhkan, jadi
 * tidak boleh ikut menggantung.
 */
async function periksa(nama: string, kerja: () => Promise<Hasil>): Promise<Hasil> {
  try {
    return await denganBatasWaktu(kerja(), 8000);
  } catch (galat) {
    return { nama, keadaan: "gagal", pesan: pesanGalat(galat) };
  }
}

export default async function HalamanDiagnosa() {
  const hasil: Hasil[] = [];

  hasil.push({
    nama: "Sumber data",
    keadaan: memakaiSupabase() ? "baik" : "perhatian",
    pesan: memintaDriverLokal()
      ? "DATA_DRIVER disetel ke local, jadi app memakai berkas lokal. Jangan dipakai untuk jamaah."
      : memakaiSupabase()
        ? "Memakai Supabase."
        : "Kredensial Supabase belum lengkap. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di env var Vercel, lalu deploy ulang.",
  });

  hasil.push({
    nama: "Variabel Supabase",
    keadaan: kredensialSupabaseAda() ? "baik" : "gagal",
    pesan: kredensialSupabaseAda()
      ? `Alamat project terbaca: ${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim()}`
      : `NEXT_PUBLIC_SUPABASE_URL ${process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ? "terisi" : "kosong"}, SUPABASE_SERVICE_ROLE_KEY ${process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ? "terisi" : "kosong"}.`,
  });

  hasil.push({
    nama: "Alamat publik app",
    keadaan: "baik",
    pesan: `${alamatSitus()} (dipakai untuk gambar pratinjau tautan WhatsApp).`,
  });

  const pemeriksaanData = [
    periksa("Tabel settings", async () => {
      const pengaturan = await (await db()).getSettings();
      return {
        nama: "Tabel settings",
        keadaan: "baik",
        pesan: `Terbaca. Nomor WhatsApp pengurus saat ini: ${pengaturan.admin_whatsapp}.`,
      };
    }),
    periksa("Tabel seasons", async () => {
      const data = await db();
      const daftar = await data.listSeasons();
      const aktif = daftar.find((s) => s.is_active);
      if (daftar.length === 0) {
        return {
          nama: "Tabel seasons",
          keadaan: "perhatian",
          pesan: "Tabel terbaca, tetapi belum ada satu pun season. Jalankan supabase/seed.sql atau buat lewat menu Season.",
        };
      }
      return {
        nama: "Tabel seasons",
        keadaan: aktif ? "baik" : "perhatian",
        pesan: aktif
          ? `${daftar.length} season, yang aktif periode ${aktif.start_date} sampai ${aktif.end_date}.`
          : `${daftar.length} season, tetapi belum ada yang ditandai aktif. Halaman donasi tertutup selama itu.`,
      };
    }),
    periksa("Tabel donations", async () => {
      const jumlah = (await (await db()).listDonations({ status: "semua" })).length;
      return { nama: "Tabel donations", keadaan: "baik", pesan: `Terbaca, berisi ${jumlah} baris.` };
    }),
    periksa("Tabel events dan registrations", async () => {
      const data = await db();
      const acara = await data.listEvents();
      const pendaftar = await data.listRegistrations();
      return {
        nama: "Tabel events dan registrations",
        keadaan: "baik",
        pesan: `Terbaca, ${acara.length} acara dan ${pendaftar.length} pendaftar.`,
      };
    }),
    periksa("Tabel updates", async () => {
      const jumlah = (await (await db()).listUpdates()).length;
      return { nama: "Tabel updates", keadaan: "baik", pesan: `Terbaca, berisi ${jumlah} kabar.` };
    }),
    periksa("Tabel sponsors", async () => {
      const data = await db();
      const season = (await data.listSeasons())[0];
      if (!season) {
        return { nama: "Tabel sponsors", keadaan: "perhatian", pesan: "Belum bisa diperiksa karena belum ada season." };
      }
      const jumlah = (await data.listSponsors(season.id)).length;
      return { nama: "Tabel sponsors", keadaan: "baik", pesan: `Terbaca, ${jumlah} sponsor pada season terbaru.` };
    }),
  ];

  if (memakaiSupabase()) {
    pemeriksaanData.push(
      periksa("Bucket penyimpanan gambar", async () => {
        const { periksaBucketMedia } = await import("@/lib/data/supabase");
        const bucket = await periksaBucketMedia();
        return {
          nama: "Bucket penyimpanan gambar",
          keadaan: bucket.ada ? "baik" : "gagal",
          pesan: bucket.ada ? bucket.pesan : `${bucket.pesan} Jalankan bagian storage di supabase/schema.sql.`,
        };
      }),
    );
  }

  hasil.push(...(await Promise.all(pemeriksaanData)));

  const gagal = hasil.filter((h) => h.keadaan === "gagal").length;
  const perhatian = hasil.filter((h) => h.keadaan === "perhatian").length;

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Diagnosa</h1>
      <p className="mt-1 text-ink-soft">
        Halaman ini memeriksa sambungan app ke database dan penyimpanan gambar. Buka halaman ini kalau situs publik
        menampilkan pesan galat.
      </p>

      <p
        className={`mt-4 rounded-[4px] border-2 p-3 font-semibold ${
          gagal > 0 ? "border-bahaya text-bahaya" : perhatian > 0 ? "border-gold-ink text-gold-ink" : "border-sukses text-sukses"
        }`}
      >
        {gagal > 0
          ? `${gagal} pemeriksaan gagal. Perbaiki yang bertanda Gagal di bawah, lalu muat ulang halaman ini.`
          : perhatian > 0
            ? `Semua sambungan jalan, tetapi ada ${perhatian} hal yang perlu dilengkapi.`
            : "Semua pemeriksaan lolos."}
      </p>

      <ul className="mt-5 grid gap-3">
        {hasil.map((item) => (
          <li key={item.nama} className="kartu p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-[1.05rem]">{item.nama}</h2>
              <span
                className={`rounded-[4px] border-2 px-2 py-1 text-sm font-semibold ${
                  item.keadaan === "gagal"
                    ? "border-bahaya text-bahaya"
                    : item.keadaan === "perhatian"
                      ? "border-gold-ink text-gold-ink"
                      : "border-sukses text-sukses"
                }`}
              >
                {item.keadaan === "gagal" ? "Gagal" : item.keadaan === "perhatian" ? "Perlu dilengkapi" : "Baik"}
              </span>
            </div>
            <p className="mt-2 break-words text-[0.95rem]">{item.pesan}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin" className="tombol-kedua" prefetch={false}>
          Kembali ke ringkasan
        </Link>
        <Link href="/admin/pengaturan" className="tombol-kedua" prefetch={false}>
          Buka pengaturan
        </Link>
      </div>
    </div>
  );
}
