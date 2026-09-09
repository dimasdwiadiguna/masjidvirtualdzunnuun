"use server";

import { TANDA } from "@/lib/cache";
import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/data";
import { pastikanAdmin } from "@/lib/admin";
import { buatKode } from "@/lib/kode";
import { rupiah } from "@/lib/format";
import { normalkanWa } from "@/lib/wa";
import type { HasilAksi } from "@/components/admin/FormAksi";
import type { DonationStatus } from "@/lib/data/types";

const BATAS_PAKET = 2000;
const BATAS_NOMINAL = 1_000_000_000;

/** Setiap perubahan donasi bisa menggeser angka di halaman publik. */
function segarkan(): void {
  revalidateTag(TANDA.season);
  revalidatePath("/admin/donasi");
  revalidatePath("/admin");
}

async function ubahStatus(formData: FormData, status: "verified" | "rejected"): Promise<void> {
  await pastikanAdmin("admin");
  const id = String(formData.get("id") ?? "");
  const catatan = String(formData.get("catatan") ?? "").trim();
  if (!id) return;
  await (await db()).setDonationStatus(id, status, catatan || null);
  // Progress publik dihitung dari donasi terverifikasi.
  segarkan();
}

export async function verifikasiDonasi(formData: FormData): Promise<void> {
  await ubahStatus(formData, "verified");
}

export async function tolakDonasi(formData: FormData): Promise<void> {
  await ubahStatus(formData, "rejected");
}

type Isian = {
  nama: string;
  wa: string;
  paket: number;
  nominal: number;
  catatan: string | null;
  anonim: boolean;
};

/**
 * Membaca isian formulir donasi pengurus.
 *
 * Nomor WhatsApp boleh kosong di sini, tidak seperti formulir publik. Donasi
 * tunai yang diterima di masjid sering datang tanpa nomor, dan menolaknya
 * hanya akan membuat pengurus mengarang nomor supaya formulirnya mau lewat.
 */
function bacaIsian(formData: FormData, hargaPaket: number): { isian?: Isian; pesan?: string } {
  const nama = String(formData.get("nama") ?? "").trim();
  if (nama.length < 2 || nama.length > 60) {
    return { pesan: "Nama donatur perlu diisi, minimal 2 huruf." };
  }

  const waMentah = String(formData.get("whatsapp") ?? "").trim();
  let wa = "";
  if (waMentah) {
    const normal = normalkanWa(waMentah);
    if (!normal) return { pesan: "Nomor WhatsApp belum benar. Contoh yang diterima: 081234567890." };
    wa = normal;
  }

  const paket = Number(String(formData.get("paket") ?? "").trim());
  if (!Number.isInteger(paket) || paket < 1 || paket > BATAS_PAKET) {
    return { pesan: `Jumlah paket antara 1 sampai ${BATAS_PAKET}.` };
  }

  const nominalMentah = String(formData.get("nominal") ?? "").trim();
  const nominal = nominalMentah ? Number(nominalMentah.replace(/[^\d]/g, "")) : paket * hargaPaket;
  if (!Number.isInteger(nominal) || nominal < 1 || nominal > BATAS_NOMINAL) {
    return { pesan: "Nominal perlu berupa angka rupiah tanpa titik, misalnya 150000." };
  }

  return {
    isian: {
      nama,
      wa,
      paket,
      nominal,
      catatan: String(formData.get("catatan") ?? "").trim() || null,
      anonim: formData.get("anonim") === "ya",
    },
  };
}

/**
 * Memecah nominal jadi angka dasar dan angka unik.
 *
 * Angka unik hanya berguna untuk mencocokkan transfer masuk. Donasi yang
 * dicatat pengurus tidak punya transfer yang perlu dicocokkan, jadi angkanya
 * nol dan seluruh nominal masuk ke angka dasar. Yang dijaga di kedua jalur
 * adalah satu hal: dasar ditambah angka unik selalu sama dengan nominalnya.
 */
function pecahNominal(nominal: number, paket: number, hargaPaket: number): { dasar: number; unik: number } {
  const dasar = paket * hargaPaket;
  const selisih = nominal - dasar;
  if (selisih >= 0 && selisih <= 999) return { dasar, unik: selisih };
  return { dasar: nominal, unik: 0 };
}

/**
 * Dua donasi menunggu di season yang sama tidak boleh punya nominal identik,
 * karena nominal itulah yang dipakai mencocokkan transfer. Database menegakkan
 * aturan yang sama lewat indeks unik parsial, tetapi galat database berbunyi
 * seperti pesan mesin, jadi diperiksa lebih dulu di sini.
 */
async function nominalBentrok(seasonId: string, nominal: number, kecuali?: string): Promise<boolean> {
  const menunggu = await (await db()).listDonations({ status: "pending" });
  return menunggu.some((d) => d.season_id === seasonId && d.id !== kecuali && d.total_amount === nominal);
}

export async function catatDonasiManual(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  await pastikanAdmin("admin");
  const data = await db();

  const season = await data.getActiveSeason();
  if (!season) {
    return { pesan: "Belum ada season yang aktif. Aktifkan satu season dulu di menu Season." };
  }

  const { isian, pesan } = bacaIsian(formData, season.package_price);
  if (!isian) return { pesan };

  const status: DonationStatus = formData.get("status") === "pending" ? "pending" : "verified";
  if (status === "pending" && (await nominalBentrok(season.id, isian.nominal))) {
    return {
      pesan: `Sudah ada donasi lain yang menunggu dengan nominal ${rupiah(isian.nominal)}. Ubah nominalnya beberapa rupiah, atau tandai donasi ini sudah masuk.`,
    };
  }

  const { dasar, unik } = pecahNominal(isian.nominal, isian.paket, season.package_price);

  let kode = buatKode();
  for (let percobaan = 0; percobaan < 8 && (await data.codeExists(kode)); percobaan += 1) {
    kode = buatKode();
  }

  await data.createDonation({
    season_id: season.id,
    code: kode,
    donor_name: isian.nama,
    whatsapp: isian.wa,
    package_count: isian.paket,
    base_amount: dasar,
    unique_suffix: unik,
    total_amount: isian.nominal,
    is_anonymous: isian.anonim,
    status,
    admin_note: isian.catatan,
  });

  segarkan();
  return { pesan: `Donasi ${kode} tercatat.`, sukses: true };
}

export async function ubahDonasi(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  await pastikanAdmin("admin");
  const data = await db();

  const id = String(formData.get("id") ?? "");
  const donasi = id ? await data.getDonationById(id) : null;
  if (!donasi) return { pesan: "Donasi itu tidak ditemukan. Mungkin sudah dihapus dari perangkat lain." };

  // Harga paket diambil dari season milik donasi itu, bukan season yang sedang
  // aktif, supaya membetulkan donasi season lama tidak memakai harga baru.
  const season = await data.getSeasonById(donasi.season_id);
  const hargaPaket = season?.package_price ?? 15000;

  const { isian, pesan } = bacaIsian(formData, hargaPaket);
  if (!isian) return { pesan };

  if (donasi.status === "pending" && (await nominalBentrok(donasi.season_id, isian.nominal, donasi.id))) {
    return {
      pesan: `Sudah ada donasi lain yang menunggu dengan nominal ${rupiah(isian.nominal)}. Pilih nominal yang berbeda beberapa rupiah.`,
    };
  }

  const { dasar, unik } = pecahNominal(isian.nominal, isian.paket, hargaPaket);

  await data.updateDonation(donasi.id, {
    donor_name: isian.nama,
    whatsapp: isian.wa,
    package_count: isian.paket,
    base_amount: dasar,
    unique_suffix: unik,
    total_amount: isian.nominal,
    is_anonymous: isian.anonim,
    admin_note: isian.catatan,
  });

  segarkan();
  return { pesan: `Donasi ${donasi.code} diperbarui.`, sukses: true };
}
