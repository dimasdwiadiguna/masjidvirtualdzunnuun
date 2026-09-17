"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/data";
import { TANDA } from "@/lib/cache";
import { pastikanAdmin } from "@/lib/admin";
import type { RegistrationStatus } from "@/lib/data/types";

async function ubah(formData: FormData, status: RegistrationStatus): Promise<void> {
  await pastikanAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await (await db()).setRegistrationStatus(id, status);
  // Membatalkan pendaftar melepas kuota, jadi daftar acara publik ikut disegarkan.
  revalidateTag(TANDA.acara);
  revalidatePath("/admin/pendaftar");
}

export async function konfirmasiPendaftar(formData: FormData): Promise<void> {
  await ubah(formData, "confirmed");
}

export async function batalkanPendaftar(formData: FormData): Promise<void> {
  await ubah(formData, "cancelled");
}

/**
 * Menghapus pendaftar sepenuhnya.
 *
 * Membatalkan dan menghapus menjawab dua hal yang berbeda, sama seperti menolak
 * dan menghapus pada donasi (D-93). Membatalkan dipakai saat orangnya memang
 * pernah mendaftar lalu berhalangan: barisnya tetap ada sebagai catatan, dan
 * tempatnya dilepas kembali ke kuota. Menghapus dipakai untuk baris yang memang
 * tidak seharusnya ada — salah ketik panitia, kiriman coba-coba, atau satu orang
 * yang mendaftar dua kali. Baris seperti itu bukan cuma mengotori daftar:
 * nominalnya ikut terbaca saat mencocokkan transfer tiket berbayar, dan
 * pendaftaran menunggu dengan nominal kembar ditolak database (D-10).
 *
 * Hanya superadmin, tidak seperti aksi pendaftar lainnya. Menghapus tiket yang
 * sudah check-in ikut menghapus stempel kehadirannya di Jamaah Loyal, dan itu
 * bukan keputusan yang perlu diambil sambil berdiri di pintu.
 */
export async function hapusPendaftar(formData: FormData): Promise<void> {
  await pastikanAdmin("admin");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await (await db()).deleteRegistration(id);
  // Tempatnya lepas kembali ke kuota, jadi halaman acara publik ikut disegarkan.
  revalidateTag(TANDA.acara);
  revalidatePath("/admin/pendaftar");
}
