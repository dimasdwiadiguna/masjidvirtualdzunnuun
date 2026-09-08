import "server-only";
import type {
  Donation,
  DonationStatus,
  EventCapacityInfo,
  EventItem,
  Announcement,
  Kehadiran,
  SocialPost,
  HeroPhoto,
  Registration,
  RegistrationStatus,
  Season,
  SeasonProgress,
  Settings,
  Sponsor,
  Update,
} from "./types";

export type SeasonInput = Omit<Season, "id" | "created_at"> & { id?: string };
export type EventInput = Omit<EventItem, "id" | "created_at"> & { id?: string };
export type UpdateInput = Omit<Update, "id"> & { id?: string };
export type SponsorInput = Omit<Sponsor, "id"> & { id?: string };
export type HeroPhotoInput = Omit<HeroPhoto, "id" | "created_at"> & { id?: string };
export type AnnouncementInput = Omit<Announcement, "id" | "created_at"> & { id?: string };
export type SocialPostInput = Omit<SocialPost, "id" | "created_at"> & { id?: string };
export type DonationInput = Omit<Donation, "id" | "created_at" | "verified_at" | "admin_note" | "status"> & {
  status?: DonationStatus;
};
export type RegistrationInput = Omit<Registration, "id" | "created_at" | "checked_in_at">;

export type DonationFilter = { status?: DonationStatus | "semua"; cari?: string };

export interface DataDriver {
  getSettings(): Promise<Settings>;
  saveSettings(patch: Partial<Settings>): Promise<Settings>;

  listSeasons(): Promise<Season[]>;
  getActiveSeason(): Promise<Season | null>;
  getSeasonBySlug(slug: string): Promise<Season | null>;
  getSeasonById(id: string): Promise<Season | null>;
  saveSeason(input: SeasonInput): Promise<Season>;
  setActiveSeason(id: string): Promise<void>;
  seasonProgress(seasonId: string): Promise<SeasonProgress>;

  listDonations(filter?: DonationFilter): Promise<Donation[]>;
  getDonationByCode(code: string): Promise<Donation | null>;
  pendingDonationTotals(seasonId: string): Promise<number[]>;
  codeExists(code: string): Promise<boolean>;
  createDonation(input: DonationInput): Promise<Donation>;
  setDonationStatus(id: string, status: DonationStatus, adminNote: string | null): Promise<Donation | null>;

  listEvents(opts?: { hanyaTerbit?: boolean }): Promise<EventItem[]>;
  getEventBySlug(slug: string): Promise<EventItem | null>;
  getEventById(id: string): Promise<EventItem | null>;
  saveEvent(input: EventInput): Promise<EventItem>;
  deleteEvent(id: string): Promise<void>;
  eventCapacity(eventId: string, capacity: number | null): Promise<EventCapacityInfo>;
  /** Hitung kuota beberapa acara sekaligus, satu kueri untuk semuanya. */
  eventCapacities(eventIds: string[]): Promise<Map<string, number>>;

  listRegistrations(eventId?: string): Promise<Registration[]>;
  getRegistrationByCode(code: string): Promise<Registration | null>;
  pendingRegistrationTotals(eventId: string): Promise<number[]>;
  createRegistration(input: RegistrationInput): Promise<Registration>;
  setRegistrationStatus(id: string, status: RegistrationStatus): Promise<Registration | null>;
  markCheckedIn(id: string): Promise<Registration | null>;

  listUpdates(opts?: { seasonId?: string; hanyaTerbit?: boolean; limit?: number }): Promise<Update[]>;
  getUpdateById(id: string): Promise<Update | null>;
  saveUpdate(input: UpdateInput): Promise<Update>;
  deleteUpdate(id: string): Promise<void>;

  listHeroPhotos(opts?: { hanyaAktif?: boolean }): Promise<HeroPhoto[]>;
  saveHeroPhoto(input: HeroPhotoInput): Promise<HeroPhoto>;
  deleteHeroPhoto(id: string): Promise<void>;

  listAnnouncements(opts?: { hanyaAktif?: boolean }): Promise<Announcement[]>;
  getAnnouncementBySlug(slug: string): Promise<Announcement | null>;
  saveAnnouncement(input: AnnouncementInput): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<void>;

  listSocialPosts(opts?: { hanyaAktif?: boolean }): Promise<SocialPost[]>;
  saveSocialPost(input: SocialPostInput): Promise<SocialPost>;
  deleteSocialPost(id: string): Promise<void>;

  /** Berapa kali nomor ini hadir, dihitung dari tiket berstatus checked_in. */
  hitungKehadiran(whatsapp: string): Promise<number>;
  ringkasanKehadiran(): Promise<Kehadiran[]>;
  /** Membuat token kartu baru untuk satu nomor. Token lama ikut dihapus. */
  buatTautanKartu(whatsapp: string): Promise<string>;
  kartuLewatToken(token: string): Promise<string | null>;
  /** Semua token yang sudah ada, dipetakan dari nomor. Satu kueri, bukan per baris. */
  semuaTautanKartu(): Promise<Map<string, string>>;

  hitungPemenangHariIni(): Promise<number>;
  hitungKemenangan(whatsapp: string): Promise<number>;
  catatPemenang(whatsapp: string, nama: string): Promise<"tercatat" | "sudah-menang">;

  sudahMemilih(pollKey: string, penanda: string): Promise<boolean>;
  catatSuara(pollKey: string, pilihan: number, penanda: string): Promise<"tercatat" | "sudah-memilih">;
  /** Jumlah suara per indeks pilihan, panjangnya sesuai jumlah pilihan. */
  hasilPolling(pollKey: string, jumlahPilihan: number): Promise<number[]>;

  listSponsors(seasonId: string): Promise<Sponsor[]>;
  saveSponsor(input: SponsorInput): Promise<Sponsor>;
  deleteSponsor(id: string): Promise<void>;

  uploadImage(file: File, folder: string): Promise<string>;
}

let driver: DataDriver | null = null;

function terisi(nilai: string | undefined): boolean {
  return Boolean(nilai?.trim());
}

export function kredensialSupabaseAda(): boolean {
  return terisi(process.env.NEXT_PUBLIC_SUPABASE_URL) && terisi(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function memintaDriverLokal(): boolean {
  return process.env.DATA_DRIVER === "local";
}

export function memakaiSupabase(): boolean {
  return !memintaDriverLokal() && kredensialSupabaseAda();
}

/**
 * Driver lokal hanya dipakai kalau diminta lewat DATA_DRIVER, atau saat
 * menjalankan app di komputer sendiri tanpa kredensial Supabase.
 *
 * Di produksi, kredensial yang kurang tidak boleh diam-diam jatuh ke driver
 * lokal: filesystem Vercel hanya bisa dibaca, jadi penyimpanan file akan gagal
 * dengan pesan yang menyesatkan. Lebih baik satu pesan yang jelas.
 */
export async function db(): Promise<DataDriver> {
  if (driver) return driver;

  if (memintaDriverLokal() || (process.env.NODE_ENV !== "production" && !kredensialSupabaseAda())) {
    driver = (await import("./local")).createLocalDriver();
    return driver;
  }

  if (!kredensialSupabaseAda()) {
    throw new Error(
      "Kredensial Supabase belum lengkap. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di env var, lalu deploy ulang.",
    );
  }

  driver = (await import("./supabase")).createSupabaseDriver();
  return driver;
}
