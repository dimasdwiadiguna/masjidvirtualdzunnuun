import BarSosial from "@/components/BarSosial";
import FooterSitus from "@/components/FooterSitus";
import HeaderSitus from "@/components/HeaderSitus";
import NavBawah from "@/components/NavBawah";

export default function TataLetakPublik({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col pb-[96px] md:pb-0">
      <a
        href="#isi-utama"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-[8px] focus:bg-paper focus:px-4 focus:py-3 focus:font-semibold"
      >
        Lompat ke isi halaman
      </a>
      <HeaderSitus />
      <main id="isi-utama" className="flex-1">
        {children}
      </main>
      <FooterSitus />
      <BarSosial />
      <NavBawah />
    </div>
  );
}
