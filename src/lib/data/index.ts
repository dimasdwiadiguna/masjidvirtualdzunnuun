import "server-only";
import type {
  Donation,
  DonationStatus,
  EventCapacityInfo,
  EventItem,
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

  listSponsors(seasonId: string): Promise<Sponsor[]>;
  saveSponsor(input: SponsorInput): Promise<Sponsor>;
  deleteSponsor(id: string): Promise<void>;

  uploadImage(file: File, folder: string): Promise<string>;
}

let driver: DataDriver | null = null;

/**
 * Driver Supabase dipakai kalau kredensialnya ada. Kalau tidak, app jatuh ke
 * driver file lokal supaya pratinjau dan pengujian klik tetap bisa dijalankan
 * tanpa Supabase. Vercel selalu memakai Supabase karena env var-nya terisi.
 */
export async function db(): Promise<DataDriver> {
  if (driver) return driver;
  const pakaiSupabase =
    process.env.DATA_DRIVER !== "local" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  driver = pakaiSupabase
    ? (await import("./supabase")).createSupabaseDriver()
    : (await import("./local")).createLocalDriver();
  return driver;
}

export function memakaiSupabase(): boolean {
  return (
    process.env.DATA_DRIVER !== "local" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}
