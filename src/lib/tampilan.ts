import "server-only";
import { acaraTerbit, fotoHeroAktif, kuotaAcara } from "@/lib/cache";
import type { EventItem } from "@/lib/data/types";

export type AcaraDenganKuota = { acara: EventItem; sisaKuota: number | null };
export type FotoHero = { url: string; keterangan: string };

function gabungKuota(daftar: EventItem[], terpakai: Map<string, number>): AcaraDenganKuota[] {
  return daftar.map((acara) => ({
    acara,
    sisaKuota: acara.capacity === null ? null : Math.max(0, acara.capacity - (terpakai.get(acara.id) ?? 0)),
  }));
}

/** Kuota seluruh acara diambil sekali, bukan satu kueri per acara. */
async function denganKuota(daftar: EventItem[]): Promise<AcaraDenganKuota[]> {
  const perluKuota = daftar.filter((acara) => acara.capacity !== null).map((acara) => acara.id);
  const terpakai = new Map(perluKuota.length > 0 ? await kuotaAcara(perluKuota) : []);
  return gabungKuota(daftar, terpakai);
}

/** Acara terbit yang belum lewat, diurutkan dari yang paling dekat. */
export async function acaraTerdekat(batas?: number): Promise<AcaraDenganKuota[]> {
  const semua = await acaraTerbit();
  const sekarang = Date.now();
  const akan = semua.filter((acara) => new Date(acara.ends_at ?? acara.starts_at).getTime() >= sekarang);
  return denganKuota(batas ? akan.slice(0, batas) : akan);
}

export async function semuaAcaraTerbit(): Promise<AcaraDenganKuota[]> {
  return denganKuota(await acaraTerbit());
}

/**
 * Foto latar hero diambil hanya dari daftar foto hero yang dikelola pengurus,
 * bukan dipungut dari poster acara atau foto kabar. Kalau daftarnya kosong,
 * hero tampil sebagai blok warna tanpa foto.
 */
export async function fotoHero(batas = 5): Promise<FotoHero[]> {
  const foto = await fotoHeroAktif();
  return foto.slice(0, batas).map((item) => ({
    url: item.image_url,
    keterangan: item.caption?.trim() || "Kegiatan komunitas Dzun Nuun",
  }));
}
