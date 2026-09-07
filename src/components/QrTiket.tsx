"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** QR dibuat di perangkat pengunjung, tidak memanggil layanan QR dari luar. */
export default function QrTiket({ kode }: { kode: string }) {
  const [gambar, setGambar] = useState<string | null>(null);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    let batal = false;
    QRCode.toDataURL(kode, {
      width: 320,
      margin: 1,
      color: { dark: "#06232A", light: "#FFFDF7" },
      errorCorrectionLevel: "M",
    })
      .then((hasil) => {
        if (!batal) setGambar(hasil);
      })
      .catch(() => {
        if (!batal) setGagal(true);
      });
    return () => {
      batal = true;
    };
  }, [kode]);

  if (gagal) {
    return (
      <p className="petunjuk">Kode QR gagal dibuat. Panitia bisa memasukkan kode {kode} secara manual.</p>
    );
  }

  if (!gambar) {
    return (
      <div className="flex h-[200px] w-[200px] items-center justify-center rounded-[8px] border border-garis bg-paper text-sm text-ink-soft">
        Menyiapkan kode QR...
      </div>
    );
  }

  // QR berupa data URL yang dibuat di perangkat ini, jadi tidak ada yang bisa
  // dioptimasi next/image di sisi server.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={gambar}
      alt={`Kode QR untuk tiket ${kode}`}
      width={200}
      height={200}
      className="h-[200px] w-[200px] rounded-[8px] border border-garis bg-paper"
    />
  );
}
