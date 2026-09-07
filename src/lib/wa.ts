/** Menormalkan 08xx, +628xx, 628xx, dan 8xx menjadi 628xx. */
export function normalkanWa(input: string): string | null {
  const digit = input.replace(/\D/g, "");
  if (!digit) return null;
  let nomor = digit;
  if (nomor.startsWith("62")) nomor = nomor.slice(2);
  else if (nomor.startsWith("0")) nomor = nomor.slice(1);
  if (!nomor.startsWith("8")) return null;
  if (nomor.length < 8 || nomor.length > 13) return null;
  return `62${nomor}`;
}

export function linkWa(nomor: string, teks: string): string {
  return `https://wa.me/${nomor.replace(/\D/g, "")}?text=${encodeURIComponent(teks)}`;
}
