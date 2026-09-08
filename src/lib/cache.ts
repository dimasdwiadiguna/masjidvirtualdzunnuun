import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/data";
import type {
  Announcement,
  EventItem,
  HeroPhoto,
  Season,
  SeasonProgress,
  Settings,
  Sponsor,
  Update,
} from "@/lib/data/types";

/**
 * Cache data untuk halaman publik.
 *
 * Halaman publik tetap dirender per permintaan, tetapi bacaan databasenya
 * disimpan di Data Cache. Tanpa ini setiap kunjungan membuka koneksi ke
 * Supabase dari nol, dan di jaringan seluler jeda itu terasa sebagai layar
 * "sedang mengambil data" pada tiap perpindahan halaman.
 *
 * Setiap tanda (tag) dirontokkan oleh aksi yang mengubah datanya, jadi
 * perubahan pengurus tetap langsung terlihat. Angka 300 detik hanya jaring
 * pengaman kalau ada data yang berubah tanpa lewat aksi.
 *
 * Pengaturan dibaca tiga komponen sekaligus (layout, footer, bar sosial).
 * Saat cache dingin ketiganya meleset berbarengan sebelum sempat terisi, jadi
 * bacaannya dibungkus `cache()` React supaya satu render tetap satu kueri.
 */
export const TANDA = {
  pengaturan: "pengaturan",
  season: "season",
  kabar: "kabar",
  acara: "acara",
  hero: "hero",
  pengumuman: "pengumuman",
} as const;

const UMUR = 300;

const bacaPengaturan = unstable_cache(
  async (): Promise<Settings> => (await db()).getSettings(),
  ["pengaturan-publik"],
  { tags: [TANDA.pengaturan], revalidate: UMUR },
);

export const pengaturanPublik = cache(bacaPengaturan);

export const seasonAktif = unstable_cache(
  async (): Promise<Season | null> => (await db()).getActiveSeason(),
  ["season-aktif"],
  { tags: [TANDA.season], revalidate: UMUR },
);

export const seasonLewatSlug = unstable_cache(
  async (slug: string): Promise<Season | null> => (await db()).getSeasonBySlug(slug),
  ["season-slug"],
  { tags: [TANDA.season], revalidate: UMUR },
);

export const semuaSeason = unstable_cache(
  async (): Promise<Season[]> => (await db()).listSeasons(),
  ["semua-season"],
  { tags: [TANDA.season], revalidate: UMUR },
);

export const progressSeason = unstable_cache(
  async (seasonId: string): Promise<SeasonProgress> => (await db()).seasonProgress(seasonId),
  ["progress-season"],
  { tags: [TANDA.season], revalidate: UMUR },
);

export const sponsorSeason = unstable_cache(
  async (seasonId: string): Promise<Sponsor[]> => (await db()).listSponsors(seasonId),
  ["sponsor-season"],
  { tags: [TANDA.season], revalidate: UMUR },
);

export const kabarTerbit = unstable_cache(
  async (limit?: number): Promise<Update[]> => (await db()).listUpdates({ hanyaTerbit: true, limit }),
  ["kabar-terbit"],
  { tags: [TANDA.kabar], revalidate: UMUR },
);

export const kabarSeason = unstable_cache(
  async (seasonId: string): Promise<Update[]> =>
    (await db()).listUpdates({ hanyaTerbit: true, seasonId }),
  ["kabar-season"],
  { tags: [TANDA.kabar], revalidate: UMUR },
);

export const satuKabar = unstable_cache(
  async (id: string): Promise<Update | null> => (await db()).getUpdateById(id),
  ["satu-kabar"],
  { tags: [TANDA.kabar], revalidate: UMUR },
);

export const acaraTerbit = unstable_cache(
  async (): Promise<EventItem[]> => (await db()).listEvents({ hanyaTerbit: true }),
  ["acara-terbit"],
  { tags: [TANDA.acara], revalidate: UMUR },
);

export const satuAcara = unstable_cache(
  async (slug: string): Promise<EventItem | null> => (await db()).getEventBySlug(slug),
  ["satu-acara"],
  { tags: [TANDA.acara], revalidate: UMUR },
);

/** Kuota berubah tiap ada pendaftaran, jadi umurnya jauh lebih pendek. */
export const kuotaAcara = unstable_cache(
  async (eventIds: string[]): Promise<[string, number][]> => [
    ...(await (await db()).eventCapacities(eventIds)).entries(),
  ],
  ["kuota-acara"],
  { tags: [TANDA.acara], revalidate: 30 },
);

export const fotoHeroAktif = unstable_cache(
  async (): Promise<HeroPhoto[]> => (await db()).listHeroPhotos({ hanyaAktif: true }),
  ["foto-hero"],
  { tags: [TANDA.hero], revalidate: UMUR },
);

export const pengumumanAktif = unstable_cache(
  async (): Promise<Announcement[]> => (await db()).listAnnouncements({ hanyaAktif: true }),
  ["pengumuman-aktif"],
  { tags: [TANDA.pengumuman], revalidate: UMUR },
);

export const satuPengumuman = unstable_cache(
  async (slug: string): Promise<Announcement | null> => (await db()).getAnnouncementBySlug(slug),
  ["pengumuman-slug"],
  { tags: [TANDA.pengumuman], revalidate: UMUR },
);
