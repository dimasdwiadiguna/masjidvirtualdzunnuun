"use server";

import { revalidateTag } from "next/cache";
import { randomUUID } from "crypto";
import { TANDA } from "@/lib/cache";
import { db } from "@/lib/data";
import { pastikanAdmin } from "@/lib/admin";
import { JUMLAH_SOAL, bacaBankSoal } from "@/lib/kuis";
import type { InteraksiMode } from "@/lib/data/types";
import type { HasilAksi } from "@/components/admin/FormAksi";

const MODE: InteraksiMode[] = ["mati", "kuis", "polling"];

export async function simpanInteraksi(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  await pastikanAdmin("admin");
  const data = await db();
  const kini = await data.getSettings();

  const modeMentah = String(formData.get("interaksi_mode") ?? "mati") as InteraksiMode;
  const mode = MODE.includes(modeMentah) ? modeMentah : "mati";

  const bank = String(formData.get("kuis_bank") ?? "");
  const { soal, galat } = bacaBankSoal(bank);

  const pertanyaan = String(formData.get("polling_pertanyaan") ?? "").trim();
  const pilihanMentah = String(formData.get("polling_pilihan") ?? "");
  const pilihan = pilihanMentah
    .split("\n")
    .map((baris) => baris.trim())
    .filter(Boolean);

  const kuota = Number(formData.get("kuis_kuota_harian") ?? 5);

  // Kunci berganti kalau pertanyaan atau pilihannya berubah, supaya suara lama
  // tidak tercampur ke pertanyaan baru.
  const berubah =
    pertanyaan !== kini.polling_pertanyaan || pilihan.join("\n") !== kini.polling_pilihan;
  const kunci = berubah || !kini.polling_kunci ? randomUUID() : kini.polling_kunci;

  await data.saveSettings({
    interaksi_mode: mode,
    kuis_bank: bank,
    kuis_kuota_harian: Number.isFinite(kuota) && kuota > 0 ? Math.round(kuota) : 5,
    polling_pertanyaan: pertanyaan,
    polling_pilihan: pilihan.join("\n"),
    polling_kunci: kunci,
  });

  revalidateTag(TANDA.pengaturan);
  revalidateTag(TANDA.polling);

  // Isian selalu tersimpan, termasuk yang masih setengah jadi, supaya pengurus
  // bisa menyimpan draf dan melanjutkan nanti. Yang dijaga adalah tampilnya di
  // beranda: bagian yang isinya belum lengkap tidak dirender sama sekali.
  // Menolak penyimpanan justru merugikan, karena balasan aksi merender ulang
  // form ini dan pilihan mode yang belum tersimpan ikut hilang (D-21).
  return { pesan: pesanHasil(mode, soal.length, galat, pertanyaan, pilihan.length), sukses: true };
}

function pesanHasil(
  mode: InteraksiMode,
  jumlahSoal: number,
  galat: string[],
  pertanyaan: string,
  jumlahPilihan: number,
): string {
  if (mode === "mati") return "Tersimpan. Bagian kuis dan polling sedang tidak ditampilkan.";

  if (mode === "kuis") {
    if (galat.length > 0) return `Tersimpan, tetapi kuis belum tampil di beranda. ${galat[0]}`;
    if (jumlahSoal < JUMLAH_SOAL) {
      return `Tersimpan, tetapi kuis belum tampil di beranda: butuh ${JUMLAH_SOAL} soal, baru ada ${jumlahSoal}.`;
    }
    return "Tersimpan. Kuis sekarang tampil di beranda.";
  }

  if (!pertanyaan) return "Tersimpan, tetapi polling belum tampil di beranda: pertanyaannya masih kosong.";
  if (jumlahPilihan < 2) {
    return "Tersimpan, tetapi polling belum tampil di beranda: butuh minimal dua pilihan jawaban.";
  }
  return "Tersimpan. Polling sekarang tampil di beranda.";
}
