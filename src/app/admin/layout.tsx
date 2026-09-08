import Link from "next/link";
import { cookies } from "next/headers";
import { COOKIE_SESI, bolehBuka, peranToken } from "@/lib/auth";

const MENU = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/donasi", label: "Donasi" },
  { href: "/admin/season", label: "Season" },
  { href: "/admin/acara", label: "Acara" },
  { href: "/admin/pendaftar", label: "Pendaftar" },
  { href: "/admin/loyal", label: "Jamaah Loyal" },
  { href: "/admin/scan", label: "Check-in" },
  { href: "/admin/kabar", label: "Laporan" },
  { href: "/admin/hero", label: "Foto Hero" },
  { href: "/admin/pengumuman", label: "Pengumuman" },
  { href: "/admin/sosmed", label: "Post Sosmed" },
  { href: "/admin/kuis", label: "Kuis dan Polling" },
  { href: "/admin/pesan", label: "Pesan WhatsApp" },
  { href: "/admin/sponsor", label: "Sponsor" },
  { href: "/admin/pengaturan", label: "Pengaturan" },
  { href: "/admin/diagnosa", label: "Diagnosa" },
];

export default async function TataLetakAdmin({ children }: { children: React.ReactNode }) {
  const peran = await peranToken((await cookies()).get(COOKIE_SESI)?.value);
  const masukPenuh = peran !== null;
  const menu = peran ? MENU.filter((item) => bolehBuka(peran, item.href)) : [];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-garis bg-paper">
        <div className="mx-auto w-full max-w-[900px] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="font-[family-name:var(--font-judul)] text-lg font-bold">
              Panel pengurus
            </Link>
            {masukPenuh ? (
              <form method="post" action="/admin/keluar">
                <button type="submit" className="tombol-kecil">
                  Keluar
                </button>
              </form>
            ) : null}
          </div>
          {masukPenuh ? (
            <nav aria-label="Menu pengurus" className="mt-2 -mx-1 overflow-x-auto">
              <ul className="flex gap-1">
                {menu.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-[4px] px-3 font-semibold text-ink hover:bg-teal/10"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-garis bg-paper">
        <div className="mx-auto w-full max-w-[900px] px-4 py-4 text-sm">
          <Link href="/" className="underline underline-offset-4">
            Buka halaman publik
          </Link>
        </div>
      </footer>
    </div>
  );
}
