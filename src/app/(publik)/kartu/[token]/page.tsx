import type { Metadata } from "next";
import KartuKehadiran, { KartuTidakDitemukan } from "@/components/KartuKehadiran";
import { db } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kartu kehadiran",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ token: string }> };

export default async function KartuLewatTautan({ params }: Props) {
  const { token } = await params;
  const kartu = await (await db()).kartuLewatToken(token);

  if (!kartu) {
    return (
      <KartuTidakDitemukan
        judul="Kartu ini tidak ditemukan"
        penjelasan="Tautannya mungkin sudah diganti pengurus. Minta tautan baru lewat WhatsApp ke pengurus Dzun Nuun."
      />
    );
  }

  return <KartuKehadiran kartu={kartu} />;
}
