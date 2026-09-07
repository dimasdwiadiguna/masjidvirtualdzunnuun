"use server";

import { db } from "@/lib/data";
import { pastikanAdmin } from "@/lib/admin";

export type HasilScan = {
  keadaan: "kosong" | "tidak-ada" | "belum-bayar" | "dibatalkan" | "sudah-hadir" | "berhasil";
  nama?: string;
  acara?: string;
  jumlah?: number;
  kode?: string;
  waktuSebelumnya?: string;
};

export async function cekIn(_sebelumnya: HasilScan, formData: FormData): Promise<HasilScan> {
  await pastikanAdmin();
  const kode = String(formData.get("kode") ?? "")
    .trim()
    .toUpperCase();
  if (!kode) return { keadaan: "kosong" };

  const data = await db();
  const tiket = await data.getRegistrationByCode(kode);
  if (!tiket) return { keadaan: "tidak-ada", kode };

  const acara = await data.getEventById(tiket.event_id);
  const dasar = { nama: tiket.name, acara: acara?.title, jumlah: tiket.quantity, kode: tiket.code };

  if (tiket.status === "cancelled") return { keadaan: "dibatalkan", ...dasar };
  if (tiket.status === "pending") return { keadaan: "belum-bayar", ...dasar };
  if (tiket.status === "checked_in") {
    return { keadaan: "sudah-hadir", ...dasar, waktuSebelumnya: tiket.checked_in_at ?? undefined };
  }

  await data.markCheckedIn(tiket.id);
  return { keadaan: "berhasil", ...dasar };
}
