type Jejak = { jumlah: number; mulai: number };

const jejak = new Map<string, Jejak>();

/**
 * Pembatas sederhana di memori proses. Cukup untuk menahan banjir entri sampah
 * dari satu IP. Vercel bisa menjalankan beberapa instance, jadi ini bukan
 * jaminan global, hanya rem pertama.
 */
export function lewatBatas(kunci: string, batas = 5, jendelaDetik = 600, catat = true): boolean {
  const sekarang = Date.now();
  const jendela = jendelaDetik * 1000;
  const kini = jejak.get(kunci);
  if (!kini || sekarang - kini.mulai > jendela) {
    if (catat) jejak.set(kunci, { jumlah: 1, mulai: sekarang });
    return false;
  }
  if (catat) {
    kini.jumlah += 1;
    if (jejak.size > 5000) jejak.clear();
    return kini.jumlah > batas;
  }
  return kini.jumlah >= batas;
}

export function ipDari(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "tanpa-ip";
}
