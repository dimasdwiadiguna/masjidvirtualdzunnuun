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
      <p className="mt-3 rounded-[4px] border-2 border-ink-soft bg-paper p-3 text-ink-soft">
        Gambar QR gagal dibuat di perangkat ini. Tidak masalah, panitia bisa memasukkan kode {kode} secara manual saat
        Anda datang.
      </p>
    );
  }

  if (!gambar) {
    return (
      <div className="mt-3 flex h-[240px] w-[240px] items-center justify-center rounded-[4px] border-2 border-ink-soft bg-paper text-sm text-ink-soft">
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
      width={240}
      height={240}
      className="mt-3 h-[240px] w-[240px] rounded-[4px] border-2 border-ink bg-paper"
    />
  );
}
