"use server";

import { revalidateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { TANDA } from "@/lib/cache";
import { db } from "@/lib/data";
import { pastikanAdmin, unggahGambar } from "@/lib/admin";
import type { HasilAksi } from "@/components/admin/FormAksi";

export async function tambahFotoHero(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  await pastikanAdmin();

  const unggahan = await unggahGambar(formData.get("foto"), "hero");
  if (unggahan.pesan) return { pesan: unggahan.pesan };
  if (!unggahan.url) return { pesan: "Pilih dulu fotonya sebelum menyimpan." };

  const urutan = Number(formData.get("sort_order") ?? 0);

  await (await db()).saveHeroPhoto({
    image_url: unggahan.url,
    caption: String(formData.get("caption") ?? "").trim() || null,
    sort_order: Number.isFinite(urutan) ? Math.round(urutan) : 0,
    is_active: formData.get("is_active") === "ya",
  });

  revalidateTag(TANDA.hero);
  return { pesan: "Foto hero ditambahkan.", sukses: true };
}

export async function hapusFotoHero(formData: FormData): Promise<void> {
  await pastikanAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await (await db()).deleteHeroPhoto(id);
  revalidateTag(TANDA.hero);
  revalidatePath("/admin/hero");
}

export async function ubahAktifFotoHero(formData: FormData): Promise<void> {
  await pastikanAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const data = await db();
  const foto = (await data.listHeroPhotos()).find((item) => item.id === id);
  if (!foto) return;
  await data.saveHeroPhoto({ ...foto, is_active: !foto.is_active });
  revalidateTag(TANDA.hero);
  revalidatePath("/admin/hero");
}
