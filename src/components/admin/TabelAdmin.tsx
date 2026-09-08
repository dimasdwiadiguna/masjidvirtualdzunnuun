import type { ReactNode } from "react";

type Props = {
  /** Dibaca pembaca layar sebagai keterangan tabel, tidak tampil di layar. */
  keterangan: string;
  kepala: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Kerangka tabel panel pengurus.
 *
 * Daftar di sini dulunya kartu bertumpuk. Tabel lebih hemat tempat dan lebih
 * mudah dipindai saat pengurus mencocokkan puluhan baris donasi dengan mutasi
 * rekening.
 */
export default function TabelAdmin({ keterangan, kepala, children, className }: Props) {
  return (
    <div className={`bungkus-tabel ${className ?? ""}`}>
      <table className="tabel-admin">
        <caption className="sr-only">{keterangan}</caption>
        <thead>{kepala}</thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
