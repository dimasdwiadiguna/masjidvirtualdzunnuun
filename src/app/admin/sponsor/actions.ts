"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/data";
import { TANDA } from "@/lib/cache";
import { pastikanAdmin, unggahGambar } from "@/lib/admin";
import type { HasilAksi } from "@/components/admin/FormAksi";
import type { SponsorTier } from "@/lib/data/types";

export async function simpanSponsor(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  await pastikanAdmin();
  const data = await db();

  const seasonId = String(formData.get("season_id") ?? "").trim();
  const nama = String(formData.get("name") ?? "").trim();
  if (!seasonId) return { pesan: "Pilih dulu season untuk sponsor ini." };
  if (nama.length < 2) return { pesan: "Nama sponsor minimal 2 huruf." };

  const unggahan = await unggahGambar(formData.get("logo"), "sponsor");
  if (unggahan.pesan) return { pesan: unggahan.pesan };

  const tier = String(formData.get("tier") ?? "pendukung") === "utama" ? "utama" : "pendukung";
  const urutan = Number(formData.get("sort_order") ?? 0);

  await data.saveSponsor({
    season_id: seasonId,
    name: nama,
    logo_url: unggahan.url ?? null,
    link_url: String(formData.get("link_url") ?? "").trim() || null,
    tier: tier as SponsorTier,
    sort_order: Number.isFinite(urutan) ? Math.round(urutan) : 0,
  });

  revalidateTag(TANDA.season);
  return { pesan: `Sponsor ${nama} tersimpan.`, sukses: true };
}

export async function hapusSponsor(formData: FormData): Promise<void> {
  await pastikanAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await (await db()).deleteSponsor(id);
  revalidateTag(TANDA.season);
  revalidatePath("/admin/sponsor");
}
