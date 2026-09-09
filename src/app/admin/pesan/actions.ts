"use server";

import { revalidateTag } from "next/cache";
import { TANDA } from "@/lib/cache";
import { db } from "@/lib/data";
import { pastikanAdmin } from "@/lib/admin";
import { TEMPLAT, periksaTemplat } from "@/lib/pesan-wa";
import type { IdPesan } from "@/lib/pesan-wa";
import type { HasilAksi } from "@/components/admin/FormAksi";

/**
 * Menyimpan kata-kata pesan WhatsApp.
 *
 * Yang disimpan hanya templat yang benar-benar berbeda dari teks bawaan. Jadi
 * mengembalikan satu pesan ke bawaannya cukup dengan mencentang kotaknya, atau
 * mengosongkan kotak teksnya, dan tidak ada salinan usang yang tertinggal di
 * database saat teks bawaan diperbaiki lewat pembaruan app.
 *
 * Suntingan yang isiannya salah tulis tetap tersimpan, tidak ditolak. Menolak
 * penyimpanan justru merugikan: balasan aksi merender ulang formulir ini, dan
 * kotak teks yang belum tersimpan ikut terhapus, jadi pengurus kehilangan
 * seluruh kalimat yang baru diketiknya (alasan yang sama dengan D-79).
 *
 * Yang dijaga adalah pemakaiannya. Templat yang isiannya salah tulis tidak
 * dipakai tombol WhatsApp mana pun: teks bawaannya yang jalan, dan halaman ini
 * menyebutkan masalahnya supaya bisa dibetulkan.
 */
export async function simpanTemplatPesan(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  await pastikanAdmin("admin");
  const data = await db();

  const simpanan: Record<string, string> = {};

  for (const templat of TEMPLAT) {
    if (formData.get(`bawaan_${templat.id}`) === "ya") continue;
    const teks = String(formData.get(`teks_${templat.id}`) ?? "")
      .replace(/\r\n/g, "\n")
      .trim();
    if (!teks || teks === templat.bawaan.trim()) continue;
    simpanan[templat.id] = teks;
  }

  await data.saveSettings({ wa_templat: simpanan });
  revalidateTag(TANDA.pengaturan);

  const bermasalah = Object.entries(simpanan).filter(
    ([id, teks]) => periksaTemplat(id as IdPesan, teks).length > 0,
  ).length;

  return {
    pesan:
      bermasalah > 0
        ? `Tersimpan, tetapi ${bermasalah} pesan belum bisa dipakai. Lihat keterangannya di halaman ini.`
        : "Tersimpan.",
    sukses: true,
  };
}
