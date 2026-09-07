"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/data";
import { pastikanAdmin } from "@/lib/admin";

async function ubahStatus(formData: FormData, status: "verified" | "rejected"): Promise<void> {
  await pastikanAdmin();
  const id = String(formData.get("id") ?? "");
  const catatan = String(formData.get("catatan") ?? "").trim();
  if (!id) return;
  await (await db()).setDonationStatus(id, status, catatan || null);
  revalidatePath("/admin/donasi");
  revalidatePath("/admin");
}

export async function verifikasiDonasi(formData: FormData): Promise<void> {
  await ubahStatus(formData, "verified");
}

export async function tolakDonasi(formData: FormData): Promise<void> {
  await ubahStatus(formData, "rejected");
}
