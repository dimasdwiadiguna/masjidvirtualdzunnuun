"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { TANDA } from "@/lib/cache";
import { db } from "@/lib/data";
import { pastikanAdmin } from "@/lib/admin";
import type { SocialPlatform } from "@/lib/data/types";
import type { HasilAksi } from "@/components/admin/FormAksi";

/**
 * Hanya menerima alamat dari kedua platform itu sendiri. Tanpa penjagaan ini,
 * pengurus bisa tanpa sengaja menempel alamat lain dan yang muncul di beranda
 * adalah kotak kosong, karena skrip embed-nya diam saja untuk alamat asing.
 */
function periksaTautan(mentah: string): { url?: string; platform?: SocialPlatform; pesan?: string } {
  const teks = mentah.trim();
  if (!teks) return { pesan: "Tempel dulu tautan postnya." };
  const lengkap = /^https?:\/\//i.test(teks) ? teks : `https://${teks}`;

  let alamat: URL;
  try {
    alamat = new URL(lengkap);
  } catch {
    return { pesan: "Tautannya belum benar. Salin ulang dari tombol bagikan di aplikasinya." };
  }

  const host = alamat.hostname.replace(/^www\./, "");
  if (host === "instagram.com" || host.endsWith(".instagram.com")) {
    return { url: alamat.toString(), platform: "instagram" };
  }
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
    return { url: alamat.toString(), platform: "tiktok" };
  }
  return { pesan: "Baru Instagram dan TikTok yang bisa ditampilkan. Tautan lain belum bisa dipakai." };
}

export async function simpanPostSosmed(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  await pastikanAdmin("admin");

  const hasil = periksaTautan(String(formData.get("post_url") ?? ""));
  if (hasil.pesan || !hasil.url || !hasil.platform) return { pesan: hasil.pesan };

  const urutan = Number(formData.get("sort_order") ?? 0);

  await (await db()).saveSocialPost({
    platform: hasil.platform,
    post_url: hasil.url,
    sort_order: Number.isFinite(urutan) ? Math.round(urutan) : 0,
    is_active: formData.get("is_active") === "ya",
  });

  revalidateTag(TANDA.sosmed);
  return { pesan: `Post ${hasil.platform === "instagram" ? "Instagram" : "TikTok"} ditambahkan.`, sukses: true };
}

export async function hapusPostSosmed(formData: FormData): Promise<void> {
  await pastikanAdmin("admin");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await (await db()).deleteSocialPost(id);
  revalidateTag(TANDA.sosmed);
  revalidatePath("/admin/sosmed");
}

export async function ubahAktifPostSosmed(formData: FormData): Promise<void> {
  await pastikanAdmin("admin");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const data = await db();
  const satu = (await data.listSocialPosts()).find((item) => item.id === id);
  if (!satu) return;
  await data.saveSocialPost({ ...satu, is_active: !satu.is_active });
  revalidateTag(TANDA.sosmed);
  revalidatePath("/admin/sosmed");
}
