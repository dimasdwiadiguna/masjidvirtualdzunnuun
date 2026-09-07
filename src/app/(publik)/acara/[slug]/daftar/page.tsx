import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FormPendaftaran from "@/components/FormPendaftaran";
import { db } from "@/lib/data";
import { sudahLewat, tanggalDanJam } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const acara = await (await db()).getEventBySlug(slug);
  return { title: acara ? `Daftar ${acara.title}` : "Pendaftaran acara", robots: { index: false } };
}

export default async function HalamanDaftar({ params }: Props) {
  const { slug } = await params;
  const data = await db();
  const acara = await data.getEventBySlug(slug);
  if (!acara || !acara.is_published) notFound();

  const kuota = await data.eventCapacity(acara.id, acara.capacity);
  const tenggatLewat = acara.registration_deadline ? sudahLewat(acara.registration_deadline) : false;
  const acaraLewat = sudahLewat(acara.ends_at ?? acara.starts_at);
  const penuh = kuota.remaining !== null && kuota.remaining <= 0;

  if (tenggatLewat || penuh || acaraLewat) {
    return (
      <div className="kolom-isi py-6">
        <h1>Pendaftaran tertutup</h1>
        <p className="mt-3 text-[0.95rem]">
          {acaraLewat
            ? "Acara ini sudah lewat."
            : penuh
              ? "Kuota acara ini sudah penuh."
              : `Pendaftaran ditutup pada ${tanggalDanJam(acara.registration_deadline as string)}.`}
        </p>
        <Link href="/acara" className="tombol-kedua mt-4">
          Lihat acara lainnya
        </Link>
      </div>
    );
  }

  return (
    <div className="kolom-isi py-6">
      <p className="text-sm text-ink-soft">Pendaftaran acara</p>
      <h1 className="mt-1">{acara.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">{tanggalDanJam(acara.starts_at)}</p>
      <FormPendaftaran
        slug={acara.slug}
        berbayar={acara.is_paid}
        harga={acara.price}
        sisaKuota={kuota.remaining}
      />
    </div>
  );
}
