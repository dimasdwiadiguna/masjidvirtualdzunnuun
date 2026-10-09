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

  // Kehadiran pertama sekaligus menerbitkan kartu orang itu: token tautannya
  // dan nomor jamaah 4 angka. Ditaruh di sini, bukan saat pengurus membuka
  // daftar Jamaah Loyal, supaya permintaan baca tidak pernah menulis (D-76).
  // Gagal menerbitkan kartu tidak boleh menggagalkan check-in yang sudah
  // tercatat: panitia sedang berdiri di pintu, dan kartunya masih bisa dibuat
  // belakangan dari menu Jamaah Loyal.
  try {
    await data.pastikanKartuJamaah(tiket.whatsapp);
  } catch {
    // Sengaja dibiarkan. Kehadirannya yang penting, dan itu sudah tersimpan.
  }

  return { keadaan: "berhasil", ...dasar };
}
