"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/data";
import { TANDA } from "@/lib/cache";
import { pastikanAdmin, unggahGambar } from "@/lib/admin";
import { dariInputWaktu } from "@/lib/format";
import type { HasilAksi } from "@/components/admin/FormAksi";

export async function simpanKabar(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  await pastikanAdmin();
  const data = await db();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const judul = String(formData.get("title") ?? "").trim();
  const isi = String(formData.get("body") ?? "").trim();
  if (judul.length < 3) return { pesan: "Judul laporan minimal 3 huruf." };
  if (isi.length < 10) return { pesan: "Isi laporan terlalu pendek. Dua sampai empat kalimat sudah cukup." };

  const penanda = String(formData.get("activity_label") ?? "").trim();
  if (penanda.length > 60) {
    return { pesan: "Penanda kegiatan terlalu panjang, maksimal 60 karakter." };
  }

  const lama = id ? await data.getUpdateById(id) : null;
  const unggahan = await unggahGambar(formData.get("gambar"), "kabar");
  if (unggahan.pesan) return { pesan: unggahan.pesan };

  const seasonId = String(formData.get("season_id") ?? "").trim() || null;

  // Isian datetime-local hanya berpresisi menit. Kalau pengurus membiarkan
  // nilainya apa adanya (menit yang sama dengan sekarang), waktu penuh dipakai
  // supaya dua kabar yang terbit berdekatan tetap bisa diurutkan dan dihitung
  // badge "kabar baru".
  const dariIsian = dariInputWaktu(String(formData.get("published_at") ?? ""));
  const sekarang = new Date().toISOString();
  const menitSama = dariIsian ? dariIsian.slice(0, 16) === sekarang.slice(0, 16) : false;
  const terbitPada = menitSama ? sekarang : (dariIsian ?? lama?.published_at ?? sekarang);

  await data.saveUpdate({
    id,
    season_id: seasonId,
    activity_label: penanda || null,
    day_number: null,
    title: judul,
    body: isi,
    image_url: formData.get("hapus_gambar") === "ya" ? null : (unggahan.url ?? lama?.image_url ?? null),
    published_at: terbitPada,
    is_published: formData.get("is_published") === "ya",
  });
  revalidateTag(TANDA.kabar);
  return { pesan: id ? "Laporan diperbarui." : `Laporan "${judul}" terbit.`, sukses: true };
}

export async function hapusKabar(formData: FormData): Promise<void> {
  await pastikanAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await (await db()).deleteUpdate(id);
  revalidateTag(TANDA.kabar);
  revalidatePath("/admin/kabar");
}
