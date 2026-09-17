"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { TANDA } from "@/lib/cache";
import { db } from "@/lib/data";
import { pastikanAdmin } from "@/lib/admin";
import { buatKode } from "@/lib/kode";
import { normalkanWa } from "@/lib/wa";

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

export type HasilTambah = {
  pesan?: string;
  sukses?: boolean;
  nama?: string;
  kode?: string;
  acara?: string;
  /** Terisi kalau tiket ini membuat jumlah hadir melewati kuota acara. */
  lewatKuota?: boolean;
};

const BATAS_ROMBONGAN = 20;

/**
 * Mencatat orang yang datang langsung tanpa mendaftar lebih dulu.
 *
 * Tiketnya dibuat lalu langsung ditandai hadir dalam satu langkah, karena
 * orangnya memang sudah berdiri di depan panitia. Kodenya tetap dibuat seperti
 * pendaftaran biasa supaya barisnya sama dengan yang lain di menu Pendaftar dan
 * di ekspor CSV.
 *
 * Nomor WhatsApp boleh kosong. Di pintu masuk, menahan orang sampai nomornya
 * selesai diketik hanya akan membuat antrean, dan panitia akan mengarang nomor
 * supaya formulirnya mau lewat. Tanpa nomor, tiketnya tetap tercatat hadir,
 * hanya tidak mendapat stempel di Jamaah Loyal.
 *
 * Kuota yang terlampaui tidak menolak kiriman: yang di pintu yang tahu apakah
 * masih ada tempat. Kelebihannya disebutkan di layar supaya tetap terlihat.
 */
export async function tambahPesertaManual(_sebelumnya: HasilTambah, formData: FormData): Promise<HasilTambah> {
  await pastikanAdmin();
  const data = await db();

  const acaraId = String(formData.get("acara") ?? "");
  const acara = acaraId ? await data.getEventById(acaraId) : null;
  if (!acara) return { pesan: "Pilih dulu acaranya." };

  const nama = String(formData.get("nama") ?? "").trim();
  if (nama.length < 2 || nama.length > 60) return { pesan: "Nama peserta perlu diisi, minimal 2 huruf." };

  const waMentah = String(formData.get("whatsapp") ?? "").trim();
  let wa = "";
  if (waMentah) {
    const normal = normalkanWa(waMentah);
    if (!normal) {
      return { pesan: "Nomor WhatsApp belum benar. Contoh yang diterima: 081234567890. Boleh juga dikosongkan." };
    }
    wa = normal;
  }

  const jumlah = Number(String(formData.get("jumlah") ?? "1").trim() || "1");
  if (!Number.isInteger(jumlah) || jumlah < 1 || jumlah > BATAS_ROMBONGAN) {
    return { pesan: `Jumlah orang antara 1 sampai ${BATAS_ROMBONGAN}. Untuk rombongan lebih besar, catat dua kali.` };
  }

  let kode = buatKode();
  for (let percobaan = 0; percobaan < 8 && (await data.codeExists(kode)); percobaan += 1) {
    kode = buatKode();
  }

  const tiket = await data.createRegistration({
    event_id: acara.id,
    name: nama,
    whatsapp: wa,
    quantity: jumlah,
    code: kode,
    // Uangnya diterima panitia di tempat, jadi nominalnya dicatat penuh dan
    // tidak perlu angka pembeda: tidak ada transfer yang harus dicocokkan.
    total_amount: acara.is_paid ? acara.price * jumlah : 0,
    unique_suffix: 0,
    status: "confirmed",
  });
  await data.markCheckedIn(tiket.id);

  const kuota = await data.eventCapacity(acara.id, acara.capacity);

  revalidateTag(TANDA.acara);
  revalidatePath("/admin/pendaftar");

  return {
    sukses: true,
    nama: tiket.name,
    kode: tiket.code,
    acara: acara.title,
    lewatKuota: kuota.remaining !== null && kuota.remaining <= 0,
  };
}
