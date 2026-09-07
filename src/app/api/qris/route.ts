import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { db } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * Gambar QRIS disalurkan ulang lewat route ini supaya tombol unduh benar-benar
 * mengunduh berkas. Atribut download pada tautan lintas domain diabaikan
 * peramban, jadi header Content-Disposition yang mengerjakannya.
 */
export async function GET() {
  const pengaturan = await (await db()).getSettings();
  const sumber = pengaturan.qris_image_url;
  if (!sumber) {
    return NextResponse.json({ pesan: "QRIS belum dipasang pengurus." }, { status: 404 });
  }

  let isi: ArrayBuffer;
  let tipe = "image/png";
  if (sumber.startsWith("/")) {
    const relatif = sumber.startsWith("/api/berkas/")
      ? path.join(".data", "uploads", sumber.replace("/api/berkas/", ""))
      : path.join("public", sumber.replace(/^\//, ""));
    const berkas = await readFile(path.join(process.cwd(), relatif));
    isi = berkas.buffer.slice(berkas.byteOffset, berkas.byteOffset + berkas.byteLength) as ArrayBuffer;
    if (sumber.endsWith(".jpg") || sumber.endsWith(".jpeg")) tipe = "image/jpeg";
    if (sumber.endsWith(".webp")) tipe = "image/webp";
  } else {
    const respons = await fetch(sumber, { cache: "no-store" });
    if (!respons.ok) {
      return NextResponse.json({ pesan: "Gambar QRIS tidak bisa diambil." }, { status: 502 });
    }
    tipe = respons.headers.get("content-type") ?? tipe;
    isi = await respons.arrayBuffer();
  }

  const ext = tipe.includes("jpeg") ? "jpg" : tipe.includes("webp") ? "webp" : "png";
  return new NextResponse(isi, {
    headers: {
      "Content-Type": tipe,
      "Content-Disposition": `attachment; filename="qris-dzun-nuun.${ext}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
