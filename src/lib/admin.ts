import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESI, peranToken, type Peran } from "@/lib/auth";
import { db } from "@/lib/data";

/**
 * Middleware sudah mengunci /admin, tapi setiap server action memeriksa ulang.
 * Kalau suatu saat matcher middleware berubah, aksi tulis tetap tertutup.
 *
 * Isi `perluPeran` dengan "admin" untuk aksi yang hanya boleh dijalankan
 * superadmin. Tanpa argumen, panitia ikut boleh.
 */
export async function pastikanAdmin(perluPeran?: Peran): Promise<Peran> {
  const token = (await cookies()).get(COOKIE_SESI)?.value;
  const peran = await peranToken(token);
  if (!peran) redirect("/admin/masuk");
  if (perluPeran === "admin" && peran !== "admin") redirect("/admin?akses=terbatas");
  return peran;
}

/** Peran pemegang sesi, atau null kalau belum masuk. Tidak mengalihkan. */
export async function peranSekarang(): Promise<Peran | null> {
  return peranToken((await cookies()).get(COOKIE_SESI)?.value);
}

const TIPE_DIIZINKAN = ["image/jpeg", "image/png", "image/webp"];
const UKURAN_MAKS = 3 * 1024 * 1024;

export type HasilUnggah = { url?: string; pesan?: string };

export async function unggahGambar(berkas: FormDataEntryValue | null, folder: string): Promise<HasilUnggah> {
  if (!berkas || typeof berkas === "string") return {};
  const file = berkas as File;
  if (file.size === 0) return {};
  if (!TIPE_DIIZINKAN.includes(file.type)) {
    return { pesan: "Format gambar harus JPG, PNG, atau WebP." };
  }
  if (file.size > UKURAN_MAKS) {
    return { pesan: "Ukuran gambar maksimal 3 MB. Kecilkan dulu lewat aplikasi galeri di HP." };
  }
  const url = await (await db()).uploadImage(file, folder);
  return { url };
}

export function buatSlug(teks: string): string {
  return teks
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
