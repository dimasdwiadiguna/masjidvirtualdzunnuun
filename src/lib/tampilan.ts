import "server-only";
import { db } from "@/lib/data";
import type { EventItem } from "@/lib/data/types";

export type AcaraDenganKuota = { acara: EventItem; sisaKuota: number | null };

/** Acara terbit yang belum lewat, diurutkan dari yang paling dekat. */
export async function acaraTerdekat(batas?: number): Promise<AcaraDenganKuota[]> {
  const data = await db();
  const semua = await data.listEvents({ hanyaTerbit: true });
  const sekarang = Date.now();
  const akan = semua.filter((acara) => new Date(acara.ends_at ?? acara.starts_at).getTime() >= sekarang);
  const dipakai = batas ? akan.slice(0, batas) : akan;
  return Promise.all(
    dipakai.map(async (acara) => ({
      acara,
      sisaKuota: (await data.eventCapacity(acara.id, acara.capacity)).remaining,
    })),
  );
}

export async function semuaAcaraTerbit(): Promise<AcaraDenganKuota[]> {
  const data = await db();
  const semua = await data.listEvents({ hanyaTerbit: true });
  return Promise.all(
    semua.map(async (acara) => ({
      acara,
      sisaKuota: (await data.eventCapacity(acara.id, acara.capacity)).remaining,
    })),
  );
}

export type FotoHero = { url: string; keterangan: string };

/**
 * Foto latar hero diambil dari gambar yang benar-benar diunggah pengurus:
 * foto header season, foto Kabar Aksi, lalu poster acara. Tidak ada foto stok,
 * dan kalau belum ada satu pun, hero tampil sebagai blok warna tanpa foto.
 */
export async function fotoHero(batas = 5): Promise<FotoHero[]> {
  const data = await db();
  const [season, kabar, acara] = await Promise.all([
    data.getActiveSeason(),
    data.listUpdates({ hanyaTerbit: true, limit: 6 }),
    data.listEvents({ hanyaTerbit: true }),
  ]);

  const kandidat: FotoHero[] = [];
  if (season?.header_image_url) {
    kandidat.push({ url: season.header_image_url, keterangan: "Foto kegiatan season yang sedang berjalan" });
  }
  for (const item of kabar) {
    if (item.image_url) kandidat.push({ url: item.image_url, keterangan: item.title });
  }
  for (const item of acara) {
    if (item.poster_url) kandidat.push({ url: item.poster_url, keterangan: `Poster acara ${item.title}` });
  }

  const terpakai = new Set<string>();
  return kandidat
    .filter((item) => (terpakai.has(item.url) ? false : terpakai.add(item.url) !== undefined))
    .slice(0, batas);
}
