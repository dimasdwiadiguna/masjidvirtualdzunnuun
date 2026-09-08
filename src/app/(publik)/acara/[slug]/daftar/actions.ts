"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/data";
import { buatKode, pilihSuffix } from "@/lib/kode";
import { ipDari, lewatBatas } from "@/lib/ratelimit";
import { sudahLewat } from "@/lib/format";
import { normalkanWa } from "@/lib/wa";
import { TANDA } from "@/lib/cache";

export type HasilFormDaftar = {
  pesan?: string;
  galat?: { nama?: string; whatsapp?: string; jumlah?: string };
};

export async function kirimPendaftaran(
  _sebelumnya: HasilFormDaftar,
  formData: FormData,
): Promise<HasilFormDaftar> {
  const data = await db();
  const slug = String(formData.get("slug") ?? "");
  const acara = await data.getEventBySlug(slug);
  if (!acara || !acara.is_published) return { pesan: "Acara ini tidak ditemukan." };

  const nama = String(formData.get("nama") ?? "").trim();
  const waMentah = String(formData.get("whatsapp") ?? "").trim();
  const jumlah = Number(String(formData.get("jumlah") ?? "1").trim());

  const galat: HasilFormDaftar["galat"] = {};
  if (nama.length < 2 || nama.length > 60) galat.nama = "Tulis nama Anda, minimal 2 huruf.";
  const wa = normalkanWa(waMentah);
  if (!wa) galat.whatsapp = "Nomor WhatsApp belum benar. Contoh: 081234567890.";
  if (!Number.isInteger(jumlah) || jumlah < 1 || jumlah > 10) {
    galat.jumlah = "Jumlah orang antara 1 sampai 10. Untuk rombongan lebih besar, hubungi pengurus.";
  }
  if (Object.keys(galat).length > 0) return { galat };

  if (acara.registration_deadline && sudahLewat(acara.registration_deadline)) {
    return { pesan: "Pendaftaran acara ini sudah ditutup." };
  }
  if (sudahLewat(acara.ends_at ?? acara.starts_at)) {
    return { pesan: "Acara ini sudah lewat." };
  }

  const kuota = await data.eventCapacity(acara.id, acara.capacity);
  if (kuota.remaining !== null && kuota.remaining < jumlah) {
    return {
      pesan:
        kuota.remaining <= 0
          ? "Kuota acara ini sudah penuh."
          : `Sisa tempat tinggal ${kuota.remaining}. Kurangi jumlah orangnya.`,
    };
  }

  const ip = ipDari(await headers());
  if (lewatBatas(`daftar:${ip}`, 12, 600)) {
    return {
      pesan:
        "Sudah banyak pendaftaran dari jaringan ini dalam sepuluh menit terakhir. Tunggu sebentar lalu coba lagi, atau hubungi pengurus lewat WhatsApp kalau Anda mendaftarkan rombongan.",
    };
  }

  let kode = buatKode();
  for (let percobaan = 0; percobaan < 8 && (await data.codeExists(kode)); percobaan += 1) {
    kode = buatKode();
  }

  if (!acara.is_paid) {
    const gratis = await data.createRegistration({
      event_id: acara.id,
      name: nama,
      whatsapp: wa as string,
      quantity: jumlah,
      code: kode,
      total_amount: 0,
      unique_suffix: 0,
      status: "confirmed",
    });
    revalidateTag(TANDA.acara);
    redirect(`/tiket/${gratis.code}`);
  }

  const nominalDasar = acara.price * jumlah;
  const terpakai = new Set(await data.pendingRegistrationTotals(acara.id));
  const suffix = pilihSuffix(nominalDasar, terpakai);
  if (suffix === null) {
    return { pesan: "Nominal untuk jumlah ini sedang penuh dipakai pendaftar lain. Coba jumlah orang yang berbeda." };
  }

  const berbayar = await data.createRegistration({
    event_id: acara.id,
    name: nama,
    whatsapp: wa as string,
    quantity: jumlah,
    code: kode,
    total_amount: nominalDasar + suffix,
    unique_suffix: suffix,
    status: "pending",
  });

  revalidateTag(TANDA.acara);
  redirect(`/tiket/${berbayar.code}`);
}
