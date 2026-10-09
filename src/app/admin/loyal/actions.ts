"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/data";
import { pastikanAdmin } from "@/lib/admin";

/**
 * Membuat tautan kartu baru untuk satu nomor. Token lama ikut hangus, jadi
 * menekan tombol ini lagi adalah cara mencabut tautan yang terlanjur tersebar.
 * Kode jamaahnya tidak ikut diganti: kode itu dihafal orangnya.
 */
export async function buatTautanKartu(formData: FormData): Promise<void> {
  await pastikanAdmin("admin");
  const nomor = String(formData.get("whatsapp") ?? "").trim();
  if (!nomor) return;
  await (await db()).buatTautanKartu(nomor);
  revalidatePath("/admin/loyal");
}

/**
 * Melengkapi kartu jamaah yang belum punya kode.
 *
 * Kartu sekarang terbit sendiri saat orangnya di-check-in, jadi tombol ini
 * hanya untuk jamaah yang sudah hadir sebelum kode jamaah ada. Bedanya dengan
 * buatTautanKartu: token yang sudah ada dibiarkan, sehingga tautan yang pernah
 * dikirim ke orang itu tidak mati gara-gara pengurus menerbitkan kodenya.
 */
export async function terbitkanKartu(formData: FormData): Promise<void> {
  await pastikanAdmin("admin");
  const nomor = String(formData.get("whatsapp") ?? "").trim();
  if (!nomor) return;
  await (await db()).pastikanKartuJamaah(nomor);
  revalidatePath("/admin/loyal");
}

/**
 * Menerbitkan kode untuk semua jamaah yang belum punya, sekali tekan.
 *
 * Tanpa ini, mengganti bentuk kode berarti pengurus menekan tombol satu per
 * satu sebanyak jumlah jamaah yang sudah pernah hadir. Dikerjakan berurutan,
 * bukan berbarengan, supaya pemilihan kode tidak saling menebak kode yang
 * belum sempat tersimpan.
 */
export async function terbitkanSemuaKartu(): Promise<void> {
  await pastikanAdmin("admin");
  const data = await db();
  const [ringkasan, kartu] = await Promise.all([data.ringkasanKehadiran(), data.semuaKartuJamaah()]);
  for (const satu of ringkasan) {
    if (kartu.get(satu.whatsapp)?.kode) continue;
    await data.pastikanKartuJamaah(satu.whatsapp);
  }
  revalidatePath("/admin/loyal");
}
