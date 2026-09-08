import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESI, bolehBuka, peranToken } from "@/lib/auth";

/**
 * Seluruh /admin dikunci di sini, termasuk server action yang dikirim ke rute
 * itu. Peran ikut diperiksa: panitia hanya boleh membuka sebagian menu.
 *
 * Ini juga satu-satunya penjaga /admin/pendaftar/csv, yang tidak punya
 * pemeriksaan sendiri di dalam rutenya.
 */
export async function middleware(permintaan: NextRequest) {
  const { pathname } = permintaan.nextUrl;
  if (pathname === "/admin/masuk" || pathname === "/admin/masuk/kirim") return NextResponse.next();

  const peran = await peranToken(permintaan.cookies.get(COOKIE_SESI)?.value);

  if (peran && bolehBuka(peran, pathname)) {
    return NextResponse.next();
  }

  // Sudah masuk tetapi tidak berhak: dikembalikan ke ringkasan, bukan diminta
  // masuk lagi. Diminta masuk ulang padahal sesinya sah hanya membingungkan.
  if (peran) {
    const kembali = permintaan.nextUrl.clone();
    kembali.pathname = "/admin";
    kembali.search = "?akses=terbatas";
    return NextResponse.redirect(kembali);
  }

  const tujuan = permintaan.nextUrl.clone();
  tujuan.pathname = "/admin/masuk";
  tujuan.search = pathname === "/admin" ? "" : `?tujuan=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(tujuan);
}

export const config = { matcher: ["/admin/:path*"] };
