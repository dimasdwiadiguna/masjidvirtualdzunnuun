import { NextResponse } from "next/server";
import { db } from "@/lib/data";

export const dynamic = "force-dynamic";

function sel(nilai: string | number | null): string {
  const teks = String(nilai ?? "");
  return `"${teks.replace(/"/g, '""')}"`;
}

/**
 * Ekspor pendaftar untuk panitia. Rute ini berada di bawah /admin sehingga
 * ikut dilindungi middleware sesi pengurus.
 */
export async function GET(permintaan: Request) {
  const acaraId = new URL(permintaan.url).searchParams.get("acara");
  if (!acaraId) return NextResponse.json({ pesan: "Pilih acara lebih dulu." }, { status: 400 });

  const data = await db();
  const acara = await data.getEventById(acaraId);
  if (!acara) return NextResponse.json({ pesan: "Acara tidak ditemukan." }, { status: 404 });

  const pendaftar = await data.listRegistrations(acaraId);
  const baris = [
    ["kode", "nama", "whatsapp", "jumlah", "nominal", "status", "didaftarkan", "check_in"].join(","),
    ...pendaftar.map((r) =>
      [
        sel(r.code),
        sel(r.name),
        sel(r.whatsapp),
        sel(r.quantity),
        sel(r.total_amount),
        sel(r.status),
        sel(r.created_at),
        sel(r.checked_in_at),
      ].join(","),
    ),
  ].join("\r\n");

  return new NextResponse(`﻿${baris}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pendaftar-${acara.slug}.csv"`,
    },
  });
}
