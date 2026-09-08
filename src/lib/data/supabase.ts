import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SEED_SETTINGS } from "./seed";
import { hariIniJakarta, hitungSuara, kumpulkanKehadiran } from "./kehadiran";
import { buatTokenKartu } from "@/lib/kode";
import type {
  AnnouncementInput,
  SocialPostInput,
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
  Announcement,
  SocialPost,
  Donation,
  EventCapacityInfo,
  EventItem,
  HeroPhoto,
  Registration,
  Season,
  SeasonProgress,
  Settings,
  Sponsor,
  Update,
} from "./types";

const BUCKET = "media";

/**
 * Service role key hanya hidup di modul server ini. Tidak ada import dari
 * komponen klien, dan tidak ada NEXT_PUBLIC_ pada nama variabelnya.
 */
function klien(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Kredensial Supabase belum lengkap di env var server");
  return createClient(url, key, { auth: { persistSession: false } });
}

function lempar(pesan: string, error: { message: string } | null): void {
  if (error) throw new Error(`${pesan}: ${error.message}`);
}

export function createSupabaseDriver(): DataDriver {
  const sb = klien();

  return {
    async getSettings(): Promise<Settings> {
      const { data, error } = await sb.from("settings").select("*").limit(1).maybeSingle();
      lempar("Gagal membaca pengaturan", error);
      // Baris settings bisa saja belum dibuat kalau seed.sql belum dijalankan.
      // Itu bukan alasan untuk mematikan seluruh halaman: nilai bawaan dipakai,
      // dan halaman diagnosa pengurus yang memberi tahu apa yang kurang.
      return (data as Settings) ?? SEED_SETTINGS;
    },
    async saveSettings(patch) {
      const kini = await this.getSettings();
      const { data, error } = await sb
        .from("settings")
        .update(patch)
        .eq("id", kini.id)
        .select("*")
        .single();
      lempar("Gagal menyimpan pengaturan", error);
      return data as Settings;
    },

    async listSeasons() {
      const { data, error } = await sb.from("seasons").select("*").order("start_date", { ascending: false });
      lempar("Gagal membaca daftar season", error);
      return (data ?? []) as Season[];
    },
    async getActiveSeason() {
      const { data, error } = await sb.from("seasons").select("*").eq("is_active", true).maybeSingle();
      lempar("Gagal membaca season aktif", error);
      return (data as Season) ?? null;
    },
    async getSeasonBySlug(slug) {
      const { data, error } = await sb.from("seasons").select("*").eq("slug", slug).maybeSingle();
      lempar("Gagal membaca season", error);
      return (data as Season) ?? null;
    },
    async getSeasonById(id) {
      const { data, error } = await sb.from("seasons").select("*").eq("id", id).maybeSingle();
      lempar("Gagal membaca season", error);
      return (data as Season) ?? null;
    },
    async saveSeason(input: SeasonInput) {
      const { id, ...isi } = input;
      if (id) {
        if (isi.is_active) {
          const { error: reset } = await sb.from("seasons").update({ is_active: false }).neq("id", id);
          lempar("Gagal menonaktifkan season lain", reset);
        }
        const { data, error } = await sb.from("seasons").update(isi).eq("id", id).select("*").single();
        lempar("Gagal menyimpan season", error);
        return data as Season;
      }
      if (isi.is_active) {
        const { error: reset } = await sb.from("seasons").update({ is_active: false }).eq("is_active", true);
        lempar("Gagal menonaktifkan season lain", reset);
      }
      const { data, error } = await sb.from("seasons").insert(isi).select("*").single();
      lempar("Gagal membuat season", error);
      return data as Season;
    },
    async setActiveSeason(id) {
      const { error: reset } = await sb.from("seasons").update({ is_active: false }).neq("id", id);
      lempar("Gagal menonaktifkan season lain", reset);
      const { error } = await sb.from("seasons").update({ is_active: true }).eq("id", id);
      lempar("Gagal mengaktifkan season", error);
    },
    async seasonProgress(seasonId): Promise<SeasonProgress> {
      const { data, error } = await sb
        .from("donations")
        .select("total_amount, package_count")
        .eq("season_id", seasonId)
        .eq("status", "verified");
      lempar("Gagal menghitung progress", error);
      const baris = (data ?? []) as { total_amount: number; package_count: number }[];
      return {
        collected: baris.reduce((t, d) => t + d.total_amount, 0),
        packages: baris.reduce((t, d) => t + d.package_count, 0),
        donors: baris.length,
      };
    },

    async listDonations(filter: DonationFilter = {}) {
      let q = sb.from("donations").select("*").order("created_at", { ascending: false });
      if (filter.status && filter.status !== "semua") q = q.eq("status", filter.status);
      const cari = filter.cari?.trim();
      if (cari) {
        const digit = cari.replace(/\D/g, "");
        const bagian = [`donor_name.ilike.%${cari}%`, `code.ilike.%${cari}%`];
        if (digit) bagian.push(`total_amount.eq.${digit}`);
        q = q.or(bagian.join(","));
      }
      const { data, error } = await q;
      lempar("Gagal membaca donasi", error);
      return (data ?? []) as Donation[];
    },
    async getDonationByCode(code) {
      const { data, error } = await sb
        .from("donations")
        .select("*")
        .eq("code", code.toUpperCase())
        .maybeSingle();
      lempar("Gagal membaca donasi", error);
      return (data as Donation) ?? null;
    },
    async pendingDonationTotals(seasonId) {
      const { data, error } = await sb
        .from("donations")
        .select("total_amount")
        .eq("season_id", seasonId)
        .eq("status", "pending");
      lempar("Gagal membaca nominal pending", error);
      return ((data ?? []) as { total_amount: number }[]).map((d) => d.total_amount);
    },
    async codeExists(code) {
      const [donasi, tiket] = await Promise.all([
        sb.from("donations").select("id").eq("code", code).maybeSingle(),
        sb.from("registrations").select("id").eq("code", code).maybeSingle(),
      ]);
      return Boolean(donasi.data) || Boolean(tiket.data);
    },
    async createDonation(input: DonationInput) {
      const { data, error } = await sb
        .from("donations")
        .insert({ ...input, status: input.status ?? "pending" })
        .select("*")
        .single();
      lempar("Gagal menyimpan donasi", error);
      return data as Donation;
    },
    async setDonationStatus(id, status, adminNote) {
      const { data, error } = await sb
        .from("donations")
        .update({
          status,
          admin_note: adminNote,
          verified_at: status === "verified" ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .select("*")
        .single();
      lempar("Gagal memperbarui donasi", error);
      return (data as Donation) ?? null;
    },

    async listEvents(opts = {}) {
      let q = sb.from("events").select("*").order("starts_at", { ascending: true });
      if (opts.hanyaTerbit) q = q.eq("is_published", true);
      const { data, error } = await q;
      lempar("Gagal membaca acara", error);
      return (data ?? []) as EventItem[];
    },
    async getEventBySlug(slug) {
      const { data, error } = await sb.from("events").select("*").eq("slug", slug).maybeSingle();
      lempar("Gagal membaca acara", error);
      return (data as EventItem) ?? null;
    },
    async getEventById(id) {
      const { data, error } = await sb.from("events").select("*").eq("id", id).maybeSingle();
      lempar("Gagal membaca acara", error);
      return (data as EventItem) ?? null;
    },
    async saveEvent(input: EventInput) {
      const { id, ...isi } = input;
      if (id) {
        const { data, error } = await sb.from("events").update(isi).eq("id", id).select("*").single();
        lempar("Gagal menyimpan acara", error);
        return data as EventItem;
      }
      const { data, error } = await sb.from("events").insert(isi).select("*").single();
      lempar("Gagal membuat acara", error);
      return data as EventItem;
    },
    async deleteEvent(id) {
      const { error } = await sb.from("events").delete().eq("id", id);
      lempar("Gagal menghapus acara", error);
    },
    async eventCapacity(eventId, capacity): Promise<EventCapacityInfo> {
      const { data, error } = await sb
        .from("registrations")
        .select("quantity, status")
        .eq("event_id", eventId)
        .neq("status", "cancelled");
      lempar("Gagal menghitung kuota", error);
      const taken = ((data ?? []) as { quantity: number }[]).reduce((t, r) => t + r.quantity, 0);
      return { taken, remaining: capacity === null ? null : Math.max(0, capacity - taken) };
    },

    async eventCapacities(eventIds) {
      const hitung = new Map<string, number>();
      for (const id of eventIds) hitung.set(id, 0);
      if (eventIds.length === 0) return hitung;

      const { data, error } = await sb
        .from("registrations")
        .select("event_id, quantity")
        .in("event_id", eventIds)
        .neq("status", "cancelled");
      lempar("Gagal menghitung kuota", error);
      for (const baris of (data ?? []) as { event_id: string; quantity: number }[]) {
        hitung.set(baris.event_id, (hitung.get(baris.event_id) ?? 0) + baris.quantity);
      }
      return hitung;
    },

    async listHeroPhotos(opts = {}) {
      let q = sb.from("hero_photos").select("*").order("sort_order", { ascending: true });
      if (opts.hanyaAktif) q = q.eq("is_active", true);
      const { data, error } = await q;
      lempar("Gagal membaca foto hero", error);
      return (data ?? []) as HeroPhoto[];
    },
    async saveHeroPhoto(input: HeroPhotoInput) {
      const { id, ...isi } = input;
      if (id) {
        const { data, error } = await sb.from("hero_photos").update(isi).eq("id", id).select("*").single();
        lempar("Gagal menyimpan foto hero", error);
        return data as HeroPhoto;
      }
      const { data, error } = await sb.from("hero_photos").insert(isi).select("*").single();
      lempar("Gagal menambah foto hero", error);
      return data as HeroPhoto;
    },
    async deleteHeroPhoto(id) {
      const { error } = await sb.from("hero_photos").delete().eq("id", id);
      lempar("Gagal menghapus foto hero", error);
    },

    async listAnnouncements(opts = {}) {
      let q = sb.from("announcements").select("*").order("sort_order", { ascending: true });
      if (opts.hanyaAktif) q = q.eq("is_active", true);
      const { data, error } = await q;
      lempar("Gagal membaca pengumuman", error);
      return (data ?? []) as Announcement[];
    },
    async getAnnouncementBySlug(slug) {
      const { data, error } = await sb.from("announcements").select("*").eq("slug", slug).maybeSingle();
      lempar("Gagal membaca pengumuman", error);
      return (data as Announcement) ?? null;
    },
    async saveAnnouncement(input: AnnouncementInput) {
      const { id, ...isi } = input;
      if (id) {
        const { data, error } = await sb.from("announcements").update(isi).eq("id", id).select("*").single();
        lempar("Gagal menyimpan pengumuman", error);
        return data as Announcement;
      }
      const { data, error } = await sb.from("announcements").insert(isi).select("*").single();
      lempar("Gagal membuat pengumuman", error);
      return data as Announcement;
    },
    async deleteAnnouncement(id) {
      const { error } = await sb.from("announcements").delete().eq("id", id);
      lempar("Gagal menghapus pengumuman", error);
    },

    async listSocialPosts(opts = {}) {
      let q = sb.from("social_posts").select("*").order("sort_order", { ascending: true });
      if (opts.hanyaAktif) q = q.eq("is_active", true);
      const { data, error } = await q;
      lempar("Gagal membaca post sosmed", error);
      return (data ?? []) as SocialPost[];
    },
    async saveSocialPost(input: SocialPostInput) {
      const { id, ...isi } = input;
      if (id) {
        const { data, error } = await sb.from("social_posts").update(isi).eq("id", id).select("*").single();
        lempar("Gagal menyimpan post sosmed", error);
        return data as SocialPost;
      }
      const { data, error } = await sb.from("social_posts").insert(isi).select("*").single();
      lempar("Gagal menambah post sosmed", error);
      return data as SocialPost;
    },
    async deleteSocialPost(id) {
      const { error } = await sb.from("social_posts").delete().eq("id", id);
      lempar("Gagal menghapus post sosmed", error);
    },

    async hitungKehadiran(whatsapp) {
      const { count, error } = await sb
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .eq("whatsapp", whatsapp)
        .eq("status", "checked_in");
      lempar("Gagal menghitung kehadiran", error);
      return count ?? 0;
    },
    async ringkasanKehadiran() {
      const { data, error } = await sb
        .from("registrations")
        .select("whatsapp, name, checked_in_at")
        .eq("status", "checked_in")
        .order("checked_in_at", { ascending: false });
      lempar("Gagal membaca kehadiran", error);
      return kumpulkanKehadiran(
        (data ?? []) as { whatsapp: string; name: string; checked_in_at: string | null }[],
      );
    },
    async buatTautanKartu(whatsapp) {
      // Token lama dihapus supaya tautan yang sudah beredar bisa dianggap
      // hangus dengan menekan tombolnya sekali lagi.
      const { error: galatHapus } = await sb.from("loyalty_links").delete().eq("whatsapp", whatsapp);
      lempar("Gagal menghapus tautan kartu lama", galatHapus);
      const token = buatTokenKartu();
      const { error } = await sb.from("loyalty_links").insert({ token, whatsapp });
      lempar("Gagal membuat tautan kartu", error);
      return token;
    },
    async kartuLewatToken(token) {
      const { data, error } = await sb
        .from("loyalty_links")
        .select("whatsapp")
        .eq("token", token)
        .maybeSingle();
      lempar("Gagal membaca tautan kartu", error);
      return (data as { whatsapp: string } | null)?.whatsapp ?? null;
    },

    async semuaTautanKartu() {
      const { data, error } = await sb.from("loyalty_links").select("token, whatsapp");
      lempar("Gagal membaca tautan kartu", error);
      return new Map((data ?? []).map((satu) => [satu.whatsapp as string, satu.token as string]));
    },

    async hitungPemenangHariIni() {
      const { count, error } = await sb
        .from("quiz_winners")
        .select("id", { count: "exact", head: true })
        .eq("won_on", hariIniJakarta());
      lempar("Gagal menghitung pemenang kuis", error);
      return count ?? 0;
    },
    async hitungKemenangan(whatsapp) {
      const { count, error } = await sb
        .from("quiz_winners")
        .select("id", { count: "exact", head: true })
        .eq("whatsapp", whatsapp);
      lempar("Gagal menghitung kemenangan kuis", error);
      return count ?? 0;
    },
    async catatPemenang(whatsapp, nama) {
      const { error } = await sb
        .from("quiz_winners")
        .insert({ whatsapp, nama, won_on: hariIniJakarta() });
      // Batas unik (whatsapp, won_on) yang menegakkan satu kemenangan per hari.
      if (error?.code === "23505") return "sudah-menang";
      lempar("Gagal mencatat pemenang kuis", error);
      return "tercatat";
    },

    async sudahMemilih(pollKey, penanda) {
      const { data, error } = await sb
        .from("poll_votes")
        .select("id")
        .eq("poll_key", pollKey)
        .eq("penanda", penanda)
        .maybeSingle();
      lempar("Gagal memeriksa suara polling", error);
      return Boolean(data);
    },
    async catatSuara(pollKey, pilihan, penanda) {
      const { error } = await sb
        .from("poll_votes")
        .insert({ poll_key: pollKey, pilihan, penanda });
      if (error?.code === "23505") return "sudah-memilih";
      lempar("Gagal mencatat suara polling", error);
      return "tercatat";
    },
    async hasilPolling(pollKey, jumlahPilihan) {
      const { data, error } = await sb.from("poll_votes").select("pilihan").eq("poll_key", pollKey);
      lempar("Gagal membaca hasil polling", error);
      return hitungSuara((data ?? []) as { pilihan: number }[], jumlahPilihan);
    },

    async listRegistrations(eventId) {
      let q = sb.from("registrations").select("*").order("created_at", { ascending: false });
      if (eventId) q = q.eq("event_id", eventId);
      const { data, error } = await q;
      lempar("Gagal membaca pendaftar", error);
      return (data ?? []) as Registration[];
    },
    async getRegistrationByCode(code) {
      const { data, error } = await sb
        .from("registrations")
        .select("*")
        .eq("code", code.toUpperCase())
        .maybeSingle();
      lempar("Gagal membaca tiket", error);
      return (data as Registration) ?? null;
    },
    async pendingRegistrationTotals(eventId) {
      const { data, error } = await sb
        .from("registrations")
        .select("total_amount")
        .eq("event_id", eventId)
        .eq("status", "pending");
      lempar("Gagal membaca nominal pending", error);
      return ((data ?? []) as { total_amount: number }[]).map((r) => r.total_amount);
    },
    async createRegistration(input: RegistrationInput) {
      const { data, error } = await sb.from("registrations").insert(input).select("*").single();
      lempar("Gagal menyimpan pendaftaran", error);
      return data as Registration;
    },
    async setRegistrationStatus(id, status) {
      const { data, error } = await sb
        .from("registrations")
        .update({ status })
        .eq("id", id)
        .select("*")
        .single();
      lempar("Gagal memperbarui pendaftar", error);
      return (data as Registration) ?? null;
    },
    async markCheckedIn(id) {
      const { data, error } = await sb
        .from("registrations")
        .update({ status: "checked_in", checked_in_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();
      lempar("Gagal menandai kehadiran", error);
      return (data as Registration) ?? null;
    },

    async listUpdates(opts = {}) {
      let q = sb.from("updates").select("*").order("published_at", { ascending: false });
      if (opts.hanyaTerbit) q = q.eq("is_published", true);
      if (opts.seasonId) q = q.eq("season_id", opts.seasonId);
      if (opts.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      lempar("Gagal membaca laporan", error);
      return (data ?? []) as Update[];
    },
    async getUpdateById(id) {
      const { data, error } = await sb.from("updates").select("*").eq("id", id).maybeSingle();
      lempar("Gagal membaca laporan", error);
      return (data as Update) ?? null;
    },
    async saveUpdate(input: UpdateInput) {
      const { id, ...isi } = input;
      if (id) {
        const { data, error } = await sb.from("updates").update(isi).eq("id", id).select("*").single();
        lempar("Gagal menyimpan laporan", error);
        return data as Update;
      }
      const { data, error } = await sb.from("updates").insert(isi).select("*").single();
      lempar("Gagal membuat laporan", error);
      return data as Update;
    },
    async deleteUpdate(id) {
      const { error } = await sb.from("updates").delete().eq("id", id);
      lempar("Gagal menghapus laporan", error);
    },

    async listSponsors(seasonId) {
      const { data, error } = await sb
        .from("sponsors")
        .select("*")
        .eq("season_id", seasonId)
        .order("sort_order", { ascending: true });
      lempar("Gagal membaca sponsor", error);
      return (data ?? []) as Sponsor[];
    },
    async saveSponsor(input: SponsorInput) {
      const { id, ...isi } = input;
      if (id) {
        const { data, error } = await sb.from("sponsors").update(isi).eq("id", id).select("*").single();
        lempar("Gagal menyimpan sponsor", error);
        return data as Sponsor;
      }
      const { data, error } = await sb.from("sponsors").insert(isi).select("*").single();
      lempar("Gagal membuat sponsor", error);
      return data as Sponsor;
    },
    async deleteSponsor(id) {
      const { error } = await sb.from("sponsors").delete().eq("id", id);
      lempar("Gagal menghapus sponsor", error);
    },

    async uploadImage(file, folder) {
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const nama = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await sb.storage
        .from(BUCKET)
        .upload(nama, await file.arrayBuffer(), { contentType: file.type, upsert: false });
      lempar("Gagal mengunggah berkas", error as { message: string } | null);
      const { data } = sb.storage.from(BUCKET).getPublicUrl(nama);
      return data.publicUrl;
    },
  };
}

/** Dipakai halaman diagnosa pengurus untuk memastikan bucket gambar sudah ada. */
export async function periksaBucketMedia(): Promise<{ ada: boolean; pesan: string }> {
  try {
    const { error } = await klien().storage.from(BUCKET).list("", { limit: 1 });
    if (error) return { ada: false, pesan: error.message };
    return { ada: true, pesan: `Bucket "${BUCKET}" bisa dibaca.` };
  } catch (galat) {
    return { ada: false, pesan: galat instanceof Error ? galat.message : "Gagal memeriksa bucket." };
  }
}
