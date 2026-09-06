import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESI, tokenSah } from "@/lib/auth";

/** Seluruh /admin dikunci di sini, termasuk server action yang dikirim ke rute itu. */
export async function middleware(permintaan: NextRequest) {
  const { pathname } = permintaan.nextUrl;
  if (pathname === "/admin/masuk" || pathname === "/admin/masuk/kirim") return NextResponse.next();

  if (await tokenSah(permintaan.cookies.get(COOKIE_SESI)?.value)) {
    return NextResponse.next();
  }

  const tujuan = permintaan.nextUrl.clone();
  tujuan.pathname = "/admin/masuk";
  tujuan.search = pathname === "/admin" ? "" : `?tujuan=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(tujuan);
}

export const config = { matcher: ["/admin/:path*"] };
