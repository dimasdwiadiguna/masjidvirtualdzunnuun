import { NextResponse } from "next/server";
import { db } from "@/lib/data";

export const dynamic = "force-dynamic";

function waktuIcs(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function amankan(teks: string): string {
  return teks.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\;");
}

export async function GET(_permintaan: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const acara = await (await db()).getEventBySlug(slug);
  if (!acara || !acara.is_published) {
    return NextResponse.json({ pesan: "Acara tidak ditemukan." }, { status: 404 });
  }

  const selesai = acara.ends_at ?? new Date(new Date(acara.starts_at).getTime() + 2 * 3600_000).toISOString();
  const baris = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dzun Nuun//Acara//ID",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${acara.id}@dzunnuun`,
    `DTSTAMP:${waktuIcs(new Date().toISOString())}`,
    `DTSTART:${waktuIcs(acara.starts_at)}`,
    `DTEND:${waktuIcs(selesai)}`,
    `SUMMARY:${amankan(acara.title)}`,
    acara.location_name ? `LOCATION:${amankan(acara.location_name)}` : null,
    acara.description ? `DESCRIPTION:${amankan(acara.description.slice(0, 300))}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return new NextResponse(baris.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${acara.slug}.ics"`,
    },
  });
}
