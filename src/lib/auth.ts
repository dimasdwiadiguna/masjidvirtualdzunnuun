export const COOKIE_SESI = "dzn_admin";
const UMUR_SESI_DETIK = 60 * 60 * 12;

function rahasia(): string {
  const nilai = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!nilai) throw new Error("ADMIN_PASSWORD atau ADMIN_SESSION_SECRET belum diisi di env var");
  return nilai;
}

async function tandaTangan(pesan: string): Promise<string> {
  const kunci = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(rahasia()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const tanda = await crypto.subtle.sign("HMAC", kunci, new TextEncoder().encode(pesan));
  return Array.from(new Uint8Array(tanda))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function buatToken(): Promise<{ nilai: string; maxAge: number }> {
  const kadaluarsa = Date.now() + UMUR_SESI_DETIK * 1000;
  const isi = `admin.${kadaluarsa}`;
  return { nilai: `${isi}.${await tandaTangan(isi)}`, maxAge: UMUR_SESI_DETIK };
}

export async function tokenSah(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const bagian = token.split(".");
  if (bagian.length !== 3) return false;
  const [subjek, kadaluarsa, tanda] = bagian;
  if (subjek !== "admin") return false;
  const waktu = Number(kadaluarsa);
  if (!Number.isFinite(waktu) || waktu < Date.now()) return false;
  const harusnya = await tandaTangan(`${subjek}.${kadaluarsa}`);
  if (harusnya.length !== tanda.length) return false;
  let beda = 0;
  for (let i = 0; i < harusnya.length; i += 1) beda |= harusnya.charCodeAt(i) ^ tanda.charCodeAt(i);
  return beda === 0;
}

/** Password dibandingkan dengan panjang waktu tetap supaya tidak bocor lewat timing. */
export function passwordCocok(masukan: string): boolean {
  const asli = process.env.ADMIN_PASSWORD ?? "";
  if (!asli) return false;
  const a = new TextEncoder().encode(masukan);
  const b = new TextEncoder().encode(asli);
  let beda = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    beda |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return beda === 0;
}
