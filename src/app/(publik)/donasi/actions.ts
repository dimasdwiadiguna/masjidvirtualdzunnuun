"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/data";
import { buatKode, pilihSuffix } from "@/lib/kode";
import { ipDari, lewatBatas } from "@/lib/ratelimit";
import { normalkanWa } from "@/lib/wa";
import { KUKI_DONASI, simpanKodeHasil } from "@/lib/kuki-hasil";

export type HasilFormDonasi = {
  pesan?: string;
  galat?: { nama?: string; whatsapp?: string; paket?: string };
};

const BATAS_PAKET = 2000;

export async function kirimDonasi(
  _sebelumnya: HasilFormDonasi,
  formData: FormData,
): Promise<HasilFormDonasi> {
  const data = await db();
  const season = await data.getActiveSeason();
  if (!season) {
    return { pesan: "Belum ada season patungan yang berjalan, jadi formulir ini belum bisa dikirim." };
  }

  const nama = String(formData.get("nama") ?? "").trim();
  const waMentah = String(formData.get("whatsapp") ?? "").trim();
  const paket = Number(String(formData.get("paket") ?? "").trim());
  const anonim = formData.get("anonim") === "ya";

  const galat: HasilFormDonasi["galat"] = {};
  if (nama.length < 2 || nama.length > 60) galat.nama = "Tulis nama Anda, minimal 2 huruf.";
  const wa = normalkanWa(waMentah);
  if (!wa) galat.whatsapp = "Nomor WhatsApp belum benar. Contoh: 081234567890.";
  if (!Number.isInteger(paket) || paket < 1 || paket > BATAS_PAKET) {
    galat.paket = `Jumlah paket antara 1 sampai ${BATAS_PAKET}.`;
  }
  if (Object.keys(galat).length > 0) return { galat };

  // Batasnya longgar karena banyak jamaah memakai jaringan seluler yang berbagi
  // satu alamat IP. Yang ditahan adalah banjir entri sampah, bukan antrean warga
  // satu masjid yang mengisi bergantian.
  const ip = ipDari(await headers());
  if (lewatBatas(`donasi:${ip}`, 12, 600)) {
    return {
      pesan:
        "Sudah banyak pengiriman dari jaringan ini dalam sepuluh menit terakhir. Tunggu sebentar lalu coba lagi, atau hubungi pengurus lewat WhatsApp kalau Anda mengisi untuk beberapa orang sekaligus.",
    };
  }

  const nominalDasar = paket * season.package_price;
  const terpakai = new Set(await data.pendingDonationTotals(season.id));
  const suffix = pilihSuffix(nominalDasar, terpakai);
  if (suffix === null) {
    return {
      pesan:
        "Nominal untuk jumlah paket ini sedang penuh dipakai donasi lain yang belum selesai. Coba jumlah paket yang sedikit berbeda.",
    };
  }

  let kode = buatKode();
  for (let percobaan = 0; percobaan < 8 && (await data.codeExists(kode)); percobaan += 1) {
    kode = buatKode();
  }

  const donasi = await data.createDonation({
    season_id: season.id,
    code: kode,
    donor_name: nama,
    whatsapp: wa as string,
    package_count: paket,
    base_amount: nominalDasar,
    unique_suffix: suffix,
    total_amount: nominalDasar + suffix,
    is_anonymous: anonim,
  });

  await simpanKodeHasil(KUKI_DONASI, donasi.code);
  redirect("/donasi/selesai");
}
