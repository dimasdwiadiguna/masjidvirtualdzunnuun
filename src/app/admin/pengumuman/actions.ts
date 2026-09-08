"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { TANDA } from "@/lib/cache";
import { db } from "@/lib/data";
import { buatSlug, pastikanAdmin, unggahGambar } from "@/lib/admin";
import type { HasilAksi } from "@/components/admin/FormAksi";

export async function simpanPengumuman(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  await pastikanAdmin();
  const data = await db();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const judul = String(formData.get("title") ?? "").trim();
  if (judul.length < 3) return { pesan: "Judul pengumuman minimal 3 huruf." };

  const slug = buatSlug(String(formData.get("slug") ?? "").trim() || judul);
  if (!slug) return { pesan: "Alamat halaman belum bisa dibuat dari judul itu. Isi manual." };

  const lama = id ? (await data.listAnnouncements()).find((satu) => satu.id === id) : null;
  if (id && !lama) return { pesan: "Pengumuman yang mau diubah sudah tidak ada." };

  const bentrok = await data.getAnnouncementBySlug(slug);
  if (bentrok && bentrok.id !== id) {
    return { pesan: `Alamat "${slug}" sudah dipakai pengumuman lain. Ganti judul atau isi alamatnya manual.` };
  }

  const unggahan = await unggahGambar(formData.get("gambar"), "pengumuman");
  if (unggahan.pesan) return { pesan: unggahan.pesan };

  const gambar = unggahan.url ?? lama?.image_url ?? null;
  if (!gambar) return { pesan: "Pengumuman selalu berupa gambar. Pilih dulu gambarnya sebelum menyimpan." };

  const urutan = Number(formData.get("sort_order") ?? 0);

  try {
    await data.saveAnnouncement({
      ...(id ? { id } : {}),
      slug,
      title: judul,
      image_url: gambar,
      body: String(formData.get("body") ?? "").trim() || null,
      sort_order: Number.isFinite(urutan) ? Math.round(urutan) : 0,
      is_active: formData.get("is_active") === "ya",
    });
  } catch (galat) {
    return { pesan: galat instanceof Error ? galat.message : "Pengumuman gagal disimpan." };
  }

  revalidateTag(TANDA.pengumuman);
  return { pesan: id ? "Pengumuman diperbarui." : `Pengumuman "${judul}" dibuat.`, sukses: true };
}

export async function hapusPengumuman(formData: FormData): Promise<void> {
  await pastikanAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await (await db()).deleteAnnouncement(id);
  revalidateTag(TANDA.pengumuman);
  revalidatePath("/admin/pengumuman");
}

export async function ubahAktifPengumuman(formData: FormData): Promise<void> {
  await pastikanAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const data = await db();
  const satu = (await data.listAnnouncements()).find((item) => item.id === id);
  if (!satu) return;
  await data.saveAnnouncement({ ...satu, is_active: !satu.is_active });
  revalidateTag(TANDA.pengumuman);
  revalidatePath("/admin/pengumuman");
}
