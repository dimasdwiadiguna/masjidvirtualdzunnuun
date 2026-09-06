const TZ = "Asia/Jakarta";

export function rupiah(value: number): string {
  return `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(value))}`;
}

export function angka(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function tanggalPanjang(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(iso));
}

export function tanggalPendek(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(iso));
}

export function jam(iso: string): string {
  return `${new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(new Date(iso))} WIB`;
}

export function tanggalDanJam(iso: string): string {
  return `${tanggalPanjang(iso)}, ${jam(iso)}`;
}

/** Bagian tanggal saja (YYYY-MM-DD) menurut waktu Jakarta, dipakai grid kalender. */
export function tanggalJakarta(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TZ,
  }).format(new Date(iso));
  return parts;
}

export function sisaHari(endDate: string): number {
  const hariIni = new Date(`${tanggalJakarta(new Date().toISOString())}T00:00:00+07:00`);
  const akhir = new Date(`${endDate}T23:59:59+07:00`);
  return Math.max(0, Math.ceil((akhir.getTime() - hariIni.getTime()) / 86_400_000));
}

export function sudahLewat(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

/**
 * Nomor WhatsApp disamarkan untuk halaman yang bisa dibuka siapa saja yang punya link.
 * 6281234567890 menjadi 0812••••890.
 */
export function samarkanWa(nomor: string): string {
  const digit = nomor.replace(/\D/g, "");
  const lokal = digit.startsWith("62") ? `0${digit.slice(2)}` : digit;
  if (lokal.length < 7) return "0•••••";
  return `${lokal.slice(0, 4)}••••${lokal.slice(-3)}`;
}

export function persen(collected: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((collected / target) * 100));
}

/** Judul season boleh kosong, jadi periode dipakai sebagai penggantinya. */
export function judulSeason(season: { title: string | null; start_date: string; end_date: string }): string {
  if (season.title && season.title.trim()) return season.title.trim();
  const mulai = new Intl.DateTimeFormat("id-ID", { month: "long", timeZone: TZ }).format(
    new Date(`${season.start_date}T00:00:00+07:00`),
  );
  const selesai = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: TZ }).format(
    new Date(`${season.end_date}T00:00:00+07:00`),
  );
  return `Patungan ${mulai} sampai ${selesai}`;
}

/** Nilai untuk input datetime-local, dibaca sebagai waktu Jakarta. */
export function keInputWaktu(iso: string | null): string {
  if (!iso) return "";
  const bagian = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TZ,
  }).formatToParts(new Date(iso));
  const ambil = (tipe: string) => bagian.find((p) => p.type === tipe)?.value ?? "00";
  return `${ambil("year")}-${ambil("month")}-${ambil("day")}T${ambil("hour")}:${ambil("minute")}`;
}

/** Kebalikannya: isian datetime-local dianggap waktu Jakarta, disimpan sebagai UTC. */
export function dariInputWaktu(nilai: string): string | null {
  if (!nilai) return null;
  const waktu = new Date(`${nilai}:00+07:00`);
  return Number.isNaN(waktu.getTime()) ? null : waktu.toISOString();
}
