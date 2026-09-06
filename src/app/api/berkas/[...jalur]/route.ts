import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TIPE: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

/**
 * Penyaji berkas untuk driver data lokal. Di Vercel gambar dilayani Supabase
 * Storage, jadi rute ini hanya terpakai saat pratinjau lokal.
 */
export async function GET(_permintaan: Request, { params }: { params: Promise<{ jalur: string[] }> }) {
  const { jalur } = await params;
  const aman = jalur.filter((bagian) => bagian && !bagian.includes("..") && !bagian.includes("/"));
  if (aman.length !== jalur.length || aman.length === 0) {
    return NextResponse.json({ pesan: "Alamat berkas tidak sah." }, { status: 400 });
  }

  const ext = (aman[aman.length - 1].split(".").pop() ?? "").toLowerCase();
  if (!TIPE[ext]) return NextResponse.json({ pesan: "Jenis berkas tidak dilayani." }, { status: 404 });

  try {
    const isi = await readFile(path.join(process.cwd(), ".data", "uploads", ...aman));
    return new NextResponse(new Uint8Array(isi), {
      headers: { "Content-Type": TIPE[ext], "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ pesan: "Berkas tidak ditemukan." }, { status: 404 });
  }
}
