"use server";

import { TANDA } from "@/lib/cache";
import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/data";
import { pastikanAdmin } from "@/lib/admin";

async function ubahStatus(formData: FormData, status: "verified" | "rejected"): Promise<void> {
  await pastikanAdmin("admin");
  const id = String(formData.get("id") ?? "");
  const catatan = String(formData.get("catatan") ?? "").trim();
  if (!id) return;
  await (await db()).setDonationStatus(id, status, catatan || null);
  // Progress publik dihitung dari donasi terverifikasi.
  revalidateTag(TANDA.season);
  revalidatePath("/admin/donasi");
  revalidatePath("/admin");
}

export async function verifikasiDonasi(formData: FormData): Promise<void> {
  await ubahStatus(formData, "verified");
}

export async function tolakDonasi(formData: FormData): Promise<void> {
  await ubahStatus(formData, "rejected");
}
