import "server-only";
import { randomUUID } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { SEED_SEASON, SEED_SETTINGS } from "./seed";
import type {
  DataDriver,
  DonationFilter,
  HeroPhotoInput,
  DonationInput,
  EventInput,
  RegistrationInput,
  SeasonInput,
  SponsorInput,
  UpdateInput,
} from "./index";
import type {
  Donation,
  DonationStatus,
  EventCapacityInfo,
  EventItem,
  HeroPhoto,
  Registration,
  RegistrationStatus,
  Season,
  SeasonProgress,
  Settings,
  Sponsor,
  Update,
} from "./types";

type Isi = {
  settings: Settings;
  heroPhotos: HeroPhoto[];
  seasons: Season[];
  donations: Donation[];
  events: EventItem[];
  registrations: Registration[];
  updates: Update[];
  sponsors: Sponsor[];
};

const BERKAS = path.join(process.cwd(), ".data", "db.json");
const UNGGAHAN = path.join(process.cwd(), ".data", "uploads");

function isiAwal(): Isi {
  return {
    settings: { ...SEED_SETTINGS },
    heroPhotos: [],
    seasons: [{ ...SEED_SEASON }],
    donations: [],
    events: [],
    registrations: [],
    updates: [],
    sponsors: [],
  };
}

/**
 * Semua operasi berkas diantrikan satu per satu. Tanpa ini, dua permintaan yang
 * datang bersamaan bisa saling menimpa isi berkas, dan pernah membuat data
 * hilang saat pratinjau.
 */
let antrian: Promise<unknown> = Promise.resolve();

function berurutan<T>(kerja: () => Promise<T>): Promise<T> {
  const hasil = antrian.then(kerja, kerja);
  antrian = hasil.catch(() => undefined);
  return hasil;
}

async function bacaMentah(): Promise<Isi> {
  try {
    const teks = await readFile(BERKAS, "utf8");
    const terurai = JSON.parse(teks) as Partial<Isi>;
    return { ...isiAwal(), ...terurai };
  } catch {
    const awal = isiAwal();
    await tulisMentah(awal);
    return awal;
  }
}

async function tulisMentah(isi: Isi): Promise<void> {
  await mkdir(path.dirname(BERKAS), { recursive: true });
  const sementara = `${BERKAS}.${randomUUID()}.tmp`;
  await writeFile(sementara, JSON.stringify(isi, null, 2), "utf8");
  await rename(sementara, BERKAS);
}

function cocokPencarian(d: Donation, cari: string): boolean {
  const q = cari.trim().toLowerCase();
  if (!q) return true;
  return (
    d.donor_name.toLowerCase().includes(q) ||
    d.code.toLowerCase().includes(q) ||
    String(d.total_amount).includes(q.replace(/\D/g, ""))
  );
}

export function createLocalDriver(): DataDriver {
  return {
    async getSettings() {
      return berurutan(async () => {
        return (await bacaMentah()).settings;
      });
    },
    async saveSettings(patch) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        isi.settings = { ...isi.settings, ...patch, id: "settings" };
        await tulisMentah(isi);
        return isi.settings;
      });
    },

    async listSeasons() {
      return berurutan(async () => {
        const isi = await bacaMentah();
        return [...isi.seasons].sort((a, b) => b.start_date.localeCompare(a.start_date));
      });
    },
    async getActiveSeason() {
      return berurutan(async () => {
        return (await bacaMentah()).seasons.find((s) => s.is_active) ?? null;
      });
    },
    async getSeasonBySlug(slug) {
      return berurutan(async () => {
        return (await bacaMentah()).seasons.find((s) => s.slug === slug) ?? null;
      });
    },
    async getSeasonById(id) {
      return berurutan(async () => {
        return (await bacaMentah()).seasons.find((s) => s.id === id) ?? null;
      });
    },
    async saveSeason(input: SeasonInput) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        if (input.id) {
          const idx = isi.seasons.findIndex((s) => s.id === input.id);
          if (idx < 0) throw new Error("Season tidak ditemukan");
          isi.seasons[idx] = { ...isi.seasons[idx], ...input, id: input.id };
          if (input.is_active) {
            isi.seasons = isi.seasons.map((s) => ({ ...s, is_active: s.id === input.id }));
          }
          await tulisMentah(isi);
          return isi.seasons.find((s) => s.id === input.id) as Season;
        }
        const baru: Season = { ...input, id: randomUUID(), created_at: new Date().toISOString() };
        if (baru.is_active) isi.seasons = isi.seasons.map((s) => ({ ...s, is_active: false }));
        isi.seasons.push(baru);
        await tulisMentah(isi);
        return baru;
      });
    },
    async setActiveSeason(id) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        isi.seasons = isi.seasons.map((s) => ({ ...s, is_active: s.id === id }));
        await tulisMentah(isi);
      });
    },
    async seasonProgress(seasonId): Promise<SeasonProgress> {
      return berurutan(async () => {
        const isi = await bacaMentah();
        const terverifikasi = isi.donations.filter((d) => d.season_id === seasonId && d.status === "verified");
        return {
          collected: terverifikasi.reduce((t, d) => t + d.total_amount, 0),
          packages: terverifikasi.reduce((t, d) => t + d.package_count, 0),
          donors: terverifikasi.length,
        };
      });
    },

    async listDonations(filter: DonationFilter = {}) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        return isi.donations
          .filter((d) => (filter.status && filter.status !== "semua" ? d.status === filter.status : true))
          .filter((d) => cocokPencarian(d, filter.cari ?? ""))
          .sort((a, b) => b.created_at.localeCompare(a.created_at));
      });
    },
    async getDonationByCode(code) {
      return berurutan(async () => {
        return (await bacaMentah()).donations.find((d) => d.code === code.toUpperCase()) ?? null;
      });
    },
    async pendingDonationTotals(seasonId) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        return isi.donations.filter((d) => d.season_id === seasonId && d.status === "pending").map((d) => d.total_amount);
      });
    },
    async codeExists(code) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        return (
          isi.donations.some((d) => d.code === code) || isi.registrations.some((r) => r.code === code)
        );
      });
    },
    async createDonation(input: DonationInput) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        const baru: Donation = {
          ...input,
          status: input.status ?? "pending",
          id: randomUUID(),
          admin_note: null,
          created_at: new Date().toISOString(),
          verified_at: null,
        };
        isi.donations.push(baru);
        await tulisMentah(isi);
        return baru;
      });
    },
    async setDonationStatus(id, status: DonationStatus, adminNote) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        const idx = isi.donations.findIndex((d) => d.id === id);
        if (idx < 0) return null;
        isi.donations[idx] = {
          ...isi.donations[idx],
          status,
          admin_note: adminNote,
          verified_at: status === "verified" ? new Date().toISOString() : null,
        };
        await tulisMentah(isi);
        return isi.donations[idx];
      });
    },

    async listEvents(opts = {}) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        return isi.events
          .filter((e) => (opts.hanyaTerbit ? e.is_published : true))
          .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
      });
    },
    async getEventBySlug(slug) {
      return berurutan(async () => {
        return (await bacaMentah()).events.find((e) => e.slug === slug) ?? null;
      });
    },
    async getEventById(id) {
      return berurutan(async () => {
        return (await bacaMentah()).events.find((e) => e.id === id) ?? null;
      });
    },
    async saveEvent(input: EventInput) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        if (input.id) {
          const idx = isi.events.findIndex((e) => e.id === input.id);
          if (idx < 0) throw new Error("Acara tidak ditemukan");
          isi.events[idx] = { ...isi.events[idx], ...input, id: input.id };
          await tulisMentah(isi);
          return isi.events[idx];
        }
        const baru: EventItem = { ...input, id: randomUUID(), created_at: new Date().toISOString() };
        isi.events.push(baru);
        await tulisMentah(isi);
        return baru;
      });
    },
    async deleteEvent(id) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        isi.events = isi.events.filter((e) => e.id !== id);
        isi.registrations = isi.registrations.filter((r) => r.event_id !== id);
        await tulisMentah(isi);
      });
    },
    async eventCapacity(eventId, capacity): Promise<EventCapacityInfo> {
      return berurutan(async () => {
        const isi = await bacaMentah();
        const taken = isi.registrations
          .filter((r) => r.event_id === eventId && r.status !== "cancelled")
          .reduce((t, r) => t + r.quantity, 0);
        return { taken, remaining: capacity === null ? null : Math.max(0, capacity - taken) };
      });
    },

    async eventCapacities(eventIds) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        const hitung = new Map<string, number>();
        for (const id of eventIds) hitung.set(id, 0);
        for (const daftar of isi.registrations) {
          if (daftar.status === "cancelled" || !hitung.has(daftar.event_id)) continue;
          hitung.set(daftar.event_id, (hitung.get(daftar.event_id) ?? 0) + daftar.quantity);
        }
        return hitung;
      });
    },

    async listHeroPhotos(opts = {}) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        return isi.heroPhotos
          .filter((foto) => (opts.hanyaAktif ? foto.is_active : true))
          .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));
      });
    },
    async saveHeroPhoto(input: HeroPhotoInput) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        if (input.id) {
          const idx = isi.heroPhotos.findIndex((foto) => foto.id === input.id);
          if (idx < 0) throw new Error("Foto hero tidak ditemukan");
          isi.heroPhotos[idx] = { ...isi.heroPhotos[idx], ...input, id: input.id };
          await tulisMentah(isi);
          return isi.heroPhotos[idx];
        }
        const baru: HeroPhoto = { ...input, id: randomUUID(), created_at: new Date().toISOString() };
        isi.heroPhotos.push(baru);
        await tulisMentah(isi);
        return baru;
      });
    },
    async deleteHeroPhoto(id) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        isi.heroPhotos = isi.heroPhotos.filter((foto) => foto.id !== id);
        await tulisMentah(isi);
      });
    },

    async listRegistrations(eventId) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        return isi.registrations
          .filter((r) => (eventId ? r.event_id === eventId : true))
          .sort((a, b) => b.created_at.localeCompare(a.created_at));
      });
    },
    async getRegistrationByCode(code) {
      return berurutan(async () => {
        return (await bacaMentah()).registrations.find((r) => r.code === code.toUpperCase()) ?? null;
      });
    },
    async pendingRegistrationTotals(eventId) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        return isi.registrations
          .filter((r) => r.event_id === eventId && r.status === "pending")
          .map((r) => r.total_amount);
      });
    },
    async createRegistration(input: RegistrationInput) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        const baru: Registration = {
          ...input,
          id: randomUUID(),
          checked_in_at: null,
          created_at: new Date().toISOString(),
        };
        isi.registrations.push(baru);
        await tulisMentah(isi);
        return baru;
      });
    },
    async setRegistrationStatus(id, status: RegistrationStatus) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        const idx = isi.registrations.findIndex((r) => r.id === id);
        if (idx < 0) return null;
        isi.registrations[idx] = { ...isi.registrations[idx], status };
        await tulisMentah(isi);
        return isi.registrations[idx];
      });
    },
    async markCheckedIn(id) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        const idx = isi.registrations.findIndex((r) => r.id === id);
        if (idx < 0) return null;
        isi.registrations[idx] = {
          ...isi.registrations[idx],
          status: "checked_in",
          checked_in_at: new Date().toISOString(),
        };
        await tulisMentah(isi);
        return isi.registrations[idx];
      });
    },

    async listUpdates(opts = {}) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        const hasil = isi.updates
          .filter((u) => (opts.hanyaTerbit ? u.is_published : true))
          .filter((u) => (opts.seasonId ? u.season_id === opts.seasonId : true))
          .sort((a, b) => b.published_at.localeCompare(a.published_at));
        return opts.limit ? hasil.slice(0, opts.limit) : hasil;
      });
    },
    async getUpdateById(id) {
      return berurutan(async () => {
        return (await bacaMentah()).updates.find((u) => u.id === id) ?? null;
      });
    },
    async saveUpdate(input: UpdateInput) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        if (input.id) {
          const idx = isi.updates.findIndex((u) => u.id === input.id);
          if (idx < 0) throw new Error("Kabar tidak ditemukan");
          isi.updates[idx] = { ...isi.updates[idx], ...input, id: input.id };
          await tulisMentah(isi);
          return isi.updates[idx];
        }
        const baru: Update = { ...input, id: randomUUID() };
        isi.updates.push(baru);
        await tulisMentah(isi);
        return baru;
      });
    },
    async deleteUpdate(id) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        isi.updates = isi.updates.filter((u) => u.id !== id);
        await tulisMentah(isi);
      });
    },

    async listSponsors(seasonId) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        return isi.sponsors
          .filter((s) => s.season_id === seasonId)
          .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
      });
    },
    async saveSponsor(input: SponsorInput) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        if (input.id) {
          const idx = isi.sponsors.findIndex((s) => s.id === input.id);
          if (idx < 0) throw new Error("Sponsor tidak ditemukan");
          isi.sponsors[idx] = { ...isi.sponsors[idx], ...input, id: input.id };
          await tulisMentah(isi);
          return isi.sponsors[idx];
        }
        const baru: Sponsor = { ...input, id: randomUUID() };
        isi.sponsors.push(baru);
        await tulisMentah(isi);
        return baru;
      });
    },
    async deleteSponsor(id) {
      return berurutan(async () => {
        const isi = await bacaMentah();
        isi.sponsors = isi.sponsors.filter((s) => s.id !== id);
        await tulisMentah(isi);
      });
    },

    async uploadImage(file, folder) {
      await mkdir(path.join(UNGGAHAN, folder), { recursive: true });
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const nama = `${randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(UNGGAHAN, folder, nama), buffer);
      return `/api/berkas/${folder}/${nama}`;
    },
  };
}
