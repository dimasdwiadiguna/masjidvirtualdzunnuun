"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/data";
import { pastikanAdmin } from "@/lib/admin";

/**
 * Membuat tautan kartu baru untuk satu nomor. Token lama ikut hangus, jadi
 * menekan tombol ini lagi adalah cara mencabut tautan yang terlanjur tersebar.
 * Nomor jamaahnya tidak ikut diganti: nomor itu dihafal orangnya.
 */
export async function buatTautanKartu(formData: FormData): Promise<void> {
  await pastikanAdmin("admin");
  const nomor = String(formData.get("whatsapp") ?? "").trim();
  if (!nomor) return;
  await (await db()).buatTautanKartu(nomor);
  revalidatePath("/admin/loyal");
}

/**
 * Melengkapi kartu jamaah yang belum punya nomor.
 *
 * Kartu sekarang terbit sendiri saat orangnya di-check-in, jadi tombol ini
 * hanya untuk jamaah yang sudah hadir sebelum nomor jamaah ada. Bedanya dengan
 * buatTautanKartu: token yang sudah ada dibiarkan, sehingga tautan yang pernah
 * dikirim ke orang itu tidak mati gara-gara pengurus menerbitkan nomornya.
 */
export async function terbitkanKartu(formData: FormData): Promise<void> {
  await pastikanAdmin("admin");
  const nomor = String(formData.get("whatsapp") ?? "").trim();
  if (!nomor) return;
  await (await db()).pastikanKartuJamaah(nomor);
  revalidatePath("/admin/loyal");
}
