import { NextResponse } from "next/server";
import { COOKIE_SESI, bolehBuka, buatToken, cocokkanPassword } from "@/lib/auth";
import { ipDari, lewatBatas } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

function kembali(asal: URL, tujuan: string, alasan: string): NextResponse {
  const url = new URL("/admin/masuk", asal);
  url.searchParams.set("galat", alasan);
  if (tujuan !== "/admin") url.searchParams.set("tujuan", tujuan);
  return NextResponse.redirect(url, 303);
}

/**
 * Login memakai kiriman form biasa, bukan server action. Cookie sesi yang
 * dipasang lewat server action sempat belum terbaca middleware saat peramban
 * langsung mengambil halaman tujuan, sehingga pengurus terlempar balik ke
 * halaman masuk. Alur form biasa membuat peramban memasang cookie lebih dulu,
 * baru mengikuti pengalihan.
 */
export async function POST(permintaan: Request): Promise<NextResponse> {
  const asal = new URL(permintaan.url);
  const formData = await permintaan.formData();
  const password = String(formData.get("password") ?? "");
  const tujuanMentah = String(formData.get("tujuan") ?? "/admin");
  const tujuan = tujuanMentah.startsWith("/admin") && !tujuanMentah.startsWith("/admin/masuk") ? tujuanMentah : "/admin";

  // Yang dihitung hanya percobaan yang gagal, supaya pengurus yang salah ketik
  // sekali lalu benar tidak ikut terkunci.
  const kunciBatas = `masuk:${ipDari(permintaan.headers)}`;
  if (lewatBatas(kunciBatas, 8, 600, false)) {
    return kembali(asal, tujuan, "batas");
  }
  if (!process.env.ADMIN_PASSWORD) {
    return kembali(asal, tujuan, "belum-disetel");
  }

  // Satu kali catat per kiriman, bukan per password yang dicoba. Kalau tiap
  // percobaan dicatat, batas delapan kali diam-diam jadi empat.
  const peran = cocokkanPassword(password);
  if (!peran) {
    lewatBatas(kunciBatas, 8, 600, true);
    return kembali(asal, tujuan, "salah");
  }

  // Panitia yang diminta membuka halaman khusus superadmin diantar ke ringkasan
  // saja, supaya tidak masuk lalu langsung terpental.
  const tujuanPeran = bolehBuka(peran, tujuan) ? tujuan : "/admin";

  const token = await buatToken(peran);
  const respons = NextResponse.redirect(new URL(tujuanPeran, asal), 303);
  respons.cookies.set(COOKIE_SESI, token.nilai, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: token.maxAge,
  });
  return respons;
}
