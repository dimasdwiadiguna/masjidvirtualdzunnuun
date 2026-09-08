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
