"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/data";
import { TANDA } from "@/lib/cache";
import { pastikanAdmin, unggahGambar } from "@/lib/admin";
import { normalkanWa } from "@/lib/wa";
import type { HasilAksi } from "@/components/admin/FormAksi";

function tautanBersih(nilai: FormDataEntryValue | null): string | null {
  const teks = String(nilai ?? "").trim();
  if (!teks) return null;
  return /^https?:\/\//i.test(teks) ? teks : `https://${teks}`;
}

export async function simpanPengaturan(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  await pastikanAdmin();
  const data = await db();

  const waMentah = String(formData.get("admin_whatsapp") ?? "").trim();
  const wa = normalkanWa(waMentah);
  if (!wa) {
    return { pesan: "Nomor WhatsApp pengurus belum benar. Contoh yang diterima: 081234567890." };
  }

  const unggahan = await unggahGambar(formData.get("qris"), "qris");
  if (unggahan.pesan) return { pesan: unggahan.pesan };

  const hapusQris = formData.get("hapus_qris") === "ya";

  await data.saveSettings({
    admin_whatsapp: wa,
    qris_image_url: hapusQris ? null : (unggahan.url ?? undefined),
    whatsapp_channel_url: tautanBersih(formData.get("whatsapp_channel_url")),
    instagram_url: tautanBersih(formData.get("instagram_url")),
    tiktok_url: tautanBersih(formData.get("tiktok_url")),
    youtube_url: tautanBersih(formData.get("youtube_url")),
    about_markdown: String(formData.get("about_markdown") ?? "").trim(),
  });

  revalidateTag(TANDA.pengaturan);
  return { pesan: "Pengaturan tersimpan.", sukses: true };
}
