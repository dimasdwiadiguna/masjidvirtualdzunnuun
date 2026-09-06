import "server-only";
import { db } from "@/lib/data";
import type { EventItem } from "@/lib/data/types";

export type AcaraDenganKuota = { acara: EventItem; sisaKuota: number | null };

/** Acara terbit yang belum lewat, diurutkan dari yang paling dekat. */
export async function acaraTerdekat(batas?: number): Promise<AcaraDenganKuota[]> {
  const data = await db();
  const semua = await data.listEvents({ hanyaTerbit: true });
  const sekarang = Date.now();
  const akan = semua.filter((acara) => new Date(acara.ends_at ?? acara.starts_at).getTime() >= sekarang);
  const dipakai = batas ? akan.slice(0, batas) : akan;
  return Promise.all(
    dipakai.map(async (acara) => ({
      acara,
      sisaKuota: (await data.eventCapacity(acara.id, acara.capacity)).remaining,
    })),
  );
}

export async function semuaAcaraTerbit(): Promise<AcaraDenganKuota[]> {
  const data = await db();
  const semua = await data.listEvents({ hanyaTerbit: true });
  return Promise.all(
    semua.map(async (acara) => ({
      acara,
      sisaKuota: (await data.eventCapacity(acara.id, acara.capacity)).remaining,
    })),
  );
}
