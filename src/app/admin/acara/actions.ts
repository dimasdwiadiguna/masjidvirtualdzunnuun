"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { TANDA } from "@/lib/cache";
import { db } from "@/lib/data";
import { buatSlug, pastikanAdmin, unggahGambar } from "@/lib/admin";
import { dariInputWaktu } from "@/lib/format";
import type { HasilAksi } from "@/components/admin/FormAksi";

export async function simpanAcara(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  await pastikanAdmin();
  const data = await db();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const judul = String(formData.get("title") ?? "").trim();
  if (judul.length < 3) return { pesan: "Judul acara minimal 3 huruf." };

  const mulai = dariInputWaktu(String(formData.get("starts_at") ?? ""));
  if (!mulai) return { pesan: "Waktu mulai acara wajib diisi." };
  const selesai = dariInputWaktu(String(formData.get("ends_at") ?? ""));
  if (selesai && selesai < mulai) return { pesan: "Waktu selesai tidak boleh lebih awal dari waktu mulai." };

  const berbayar = formData.get("is_paid") === "ya";
  const harga = Number(formData.get("price") ?? 0);
  if (berbayar && (!Number.isFinite(harga) || harga <= 0)) {
    return { pesan: "Acara berbayar perlu harga yang lebih besar dari nol." };
  }

  const kuotaMentah = String(formData.get("capacity") ?? "").trim();
  const kuota = kuotaMentah ? Number(kuotaMentah) : null;
  if (kuota !== null && (!Number.isInteger(kuota) || kuota <= 0)) {
    return { pesan: "Kuota harus bilangan bulat lebih besar dari nol, atau dikosongkan kalau tanpa batas." };
  }

  const slug = buatSlug(String(formData.get("slug") ?? "").trim() || judul);
  if (!slug) return { pesan: "Alamat halaman acara belum bisa dibuat dari judul itu. Isi manual." };

  const lama = id ? await data.getEventById(id) : null;
  const unggahan = await unggahGambar(formData.get("poster"), "acara");
  if (unggahan.pesan) return { pesan: unggahan.pesan };

  try {
    await data.saveEvent({
      id,
      slug,
      title: judul,
      description: String(formData.get("description") ?? "").trim() || null,
      poster_url: formData.get("hapus_poster") === "ya" ? null : (unggahan.url ?? lama?.poster_url ?? null),
      starts_at: mulai,
      ends_at: selesai,
      location_name: String(formData.get("location_name") ?? "").trim() || null,
      location_map_url: String(formData.get("location_map_url") ?? "").trim() || null,
      is_paid: berbayar,
      price: berbayar ? Math.round(harga) : 0,
      capacity: kuota,
      registration_deadline: dariInputWaktu(String(formData.get("registration_deadline") ?? "")),
      is_recurring_note: String(formData.get("is_recurring_note") ?? "").trim() || null,
      is_published: formData.get("is_published") === "ya",
    });
  } catch (galat) {
    return { pesan: galat instanceof Error ? galat.message : "Acara gagal disimpan." };
  }

  revalidateTag(TANDA.acara);
  return { pesan: id ? "Acara diperbarui." : `Acara "${judul}" dibuat.`, sukses: true };
}

export async function hapusAcara(formData: FormData): Promise<void> {
  await pastikanAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await (await db()).deleteEvent(id);
  revalidateTag(TANDA.acara);
  revalidatePath("/admin/acara");
}
