"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/data";
import { pastikanAdmin } from "@/lib/admin";

/**
 * Membuat tautan kartu baru untuk satu nomor. Token lama ikut hangus, jadi
 * menekan tombol ini lagi adalah cara mencabut tautan yang terlanjur tersebar.
 */
export async function buatTautanKartu(formData: FormData): Promise<void> {
  await pastikanAdmin("admin");
  const nomor = String(formData.get("whatsapp") ?? "").trim();
  if (!nomor) return;
  await (await db()).buatTautanKartu(nomor);
  revalidatePath("/admin/loyal");
}
