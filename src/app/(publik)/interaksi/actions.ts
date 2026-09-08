"use server";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { TANDA } from "@/lib/cache";
import { db } from "@/lib/data";
import { tandaCocok } from "@/lib/auth";
import { JUMLAH_SOAL, susunKuis } from "@/lib/kuis";
import { penandaPolling } from "@/lib/kuki-hasil";
import { ipDari, lewatBatas } from "@/lib/ratelimit";
import { normalkanWa } from "@/lib/wa";

/** Percobaan kuis hanya berlaku sebentar, supaya jawaban tidak dicoba berulang seharian. */
const UMUR_PERCOBAAN_MS = 30 * 60 * 1000;

export type HasilKuis = {
  pesan?: string;
  status?: "menang" | "belum-benar" | "kuota-habis" | "sudah-menang";
  benarBerapa?: number;
};

export async function kirimJawabanKuis(_sebelumnya: HasilKuis, formData: FormData): Promise<HasilKuis> {
  const data = await db();
  const pengaturan = await data.getSettings();
  if (pengaturan.interaksi_mode !== "kuis") return { pesan: "Kuis sedang tidak dibuka." };

  const ip = ipDari(await headers());
  if (lewatBatas(`kuis:${ip}`, 30, 600)) {
    return { pesan: "Sudah terlalu banyak percobaan dari jaringan ini. Tunggu sebentar lalu coba lagi." };
  }

  const benih = Number(formData.get("benih") ?? 0);
  const waktu = Number(formData.get("waktu") ?? 0);
  const tanda = String(formData.get("tanda") ?? "");
  if (!Number.isFinite(benih) || !Number.isFinite(waktu) || !tanda) {
    return { pesan: "Kuisnya perlu dimuat ulang. Segarkan halaman ini." };
  }
  if (Date.now() - waktu > UMUR_PERCOBAAN_MS) {
    return { pesan: "Kuisnya sudah kedaluwarsa. Segarkan halaman untuk mendapat soal baru." };
  }
  if (!(await tandaCocok(`kuis.${benih}.${waktu}`, tanda))) {
    return { pesan: "Kuisnya perlu dimuat ulang. Segarkan halaman ini." };
  }

  const { kunci } = susunKuis(pengaturan.kuis_bank, benih);
  if (kunci.length < JUMLAH_SOAL) return { pesan: "Bank soalnya belum lengkap. Hubungi pengurus." };

  let benar = 0;
  kunci.forEach((jawabanBenar, indeks) => {
    if (Number(formData.get(`jawaban-${indeks}`)) === jawabanBenar) benar += 1;
  });

  if (benar < kunci.length) {
    return { status: "belum-benar", benarBerapa: benar };
  }

  const nama = String(formData.get("nama") ?? "").trim();
  const wa = normalkanWa(String(formData.get("whatsapp") ?? ""));
  if (nama.length < 2) return { pesan: "Tulis nama Anda dulu, minimal 2 huruf.", benarBerapa: benar };
  if (!wa) return { pesan: "Nomor WhatsApp belum benar. Contoh: 081234567890.", benarBerapa: benar };

  const sudah = await data.hitungPemenangHariIni();
  if (sudah >= pengaturan.kuis_kuota_harian) {
    return { status: "kuota-habis", benarBerapa: benar };
  }

  const catat = await data.catatPemenang(wa, nama);
  if (catat === "sudah-menang") return { status: "sudah-menang", benarBerapa: benar };

  return { status: "menang", benarBerapa: benar };
}

export type HasilPolling = { pesan?: string; sukses?: boolean };

export async function kirimSuaraPolling(_sebelumnya: HasilPolling, formData: FormData): Promise<HasilPolling> {
  const data = await db();
  const pengaturan = await data.getSettings();
  if (pengaturan.interaksi_mode !== "polling") return { pesan: "Polling sedang tidak dibuka." };

  const ip = ipDari(await headers());
  if (lewatBatas(`polling:${ip}`, 30, 600)) {
    return { pesan: "Sudah terlalu banyak kiriman dari jaringan ini. Tunggu sebentar lalu coba lagi." };
  }

  const pilihan = Number(formData.get("pilihan"));
  const jumlahPilihan = pengaturan.polling_pilihan.split("\n").map((b) => b.trim()).filter(Boolean).length;
  if (!Number.isInteger(pilihan) || pilihan < 0 || pilihan >= jumlahPilihan) {
    return { pesan: "Pilih dulu salah satu jawabannya." };
  }

  const penanda = await penandaPolling();
  const hasil = await data.catatSuara(pengaturan.polling_kunci, pilihan, penanda);
  revalidateTag(TANDA.polling);

  if (hasil === "sudah-memilih") return { pesan: "Anda sudah pernah memilih di polling ini.", sukses: true };
  return { sukses: true };
}

