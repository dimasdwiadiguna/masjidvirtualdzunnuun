import { NextResponse } from "next/server";
import { COOKIE_SESI } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(permintaan: Request): Promise<NextResponse> {
  const respons = NextResponse.redirect(new URL("/admin/masuk", permintaan.url), 303);
  respons.cookies.set(COOKIE_SESI, "", { httpOnly: true, path: "/", maxAge: 0 });
  return respons;
}
