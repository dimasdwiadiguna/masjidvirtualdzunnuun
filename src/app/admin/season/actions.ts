"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { TANDA } from "@/lib/cache";
import { db } from "@/lib/data";
import { buatSlug, pastikanAdmin, unggahGambar } from "@/lib/admin";
import type { HasilAksi } from "@/components/admin/FormAksi";

export async function simpanSeason(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  await pastikanAdmin();
  const data = await db();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const judul = String(formData.get("title") ?? "").trim();
  const slugMasukan = String(formData.get("slug") ?? "").trim();
  const mulai = String(formData.get("start_date") ?? "").trim();
  const selesai = String(formData.get("end_date") ?? "").trim();
  const target = Number(formData.get("target_amount") ?? 0);
  const harga = Number(formData.get("package_price") ?? 15000);

  if (!mulai || !selesai) return { pesan: "Tanggal mulai dan tanggal selesai wajib diisi." };
  if (selesai < mulai) return { pesan: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai." };
  if (!Number.isFinite(target) || target <= 0) return { pesan: "Target dana harus lebih besar dari nol." };
  if (!Number.isFinite(harga) || harga <= 0) return { pesan: "Harga per paket harus lebih besar dari nol." };

  const slug = buatSlug(slugMasukan || judul || `season-${mulai}`);
  if (!slug) return { pesan: "Alamat halaman season belum bisa dibuat. Isi judul atau alamatnya secara manual." };

  const lama = id ? await data.getSeasonById(id) : null;
  const unggahan = await unggahGambar(formData.get("header"), "season");
  if (unggahan.pesan) return { pesan: unggahan.pesan };

  try {
    await data.saveSeason({
      id,
      slug,
      title: judul || null,
      tagline: String(formData.get("tagline") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      header_image_url: formData.get("hapus_header") === "ya" ? null : (unggahan.url ?? lama?.header_image_url ?? null),
      target_amount: Math.round(target),
      package_price: Math.round(harga),
      start_date: mulai,
      end_date: selesai,
      is_active: formData.get("is_active") === "ya",
      fund_usage_summary: String(formData.get("fund_usage_summary") ?? "").trim() || null,
    });
  } catch (galat) {
    return { pesan: galat instanceof Error ? galat.message : "Season gagal disimpan." };
  }
  revalidateTag(TANDA.season);
  return { pesan: id ? "Season diperbarui." : "Season baru dibuat.", sukses: true };
}

export async function aktifkanSeason(formData: FormData): Promise<void> {
  await pastikanAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await (await db()).setActiveSeason(id);
  revalidateTag(TANDA.season);
  revalidatePath("/admin/season");
}
