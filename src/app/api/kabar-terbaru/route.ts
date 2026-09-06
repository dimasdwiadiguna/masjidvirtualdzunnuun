import { NextResponse } from "next/server";
import { db } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * Hanya mengembalikan waktu terbit kabar. Dipakai badge "kabar baru" di
 * navigasi, dan sengaja tidak memuat isi apa pun yang bersifat pribadi.
 */
export async function GET() {
  const kabar = await (await db()).listUpdates({ hanyaTerbit: true, limit: 50 });
  return NextResponse.json({ terbit: kabar.map((k) => k.published_at) });
}
