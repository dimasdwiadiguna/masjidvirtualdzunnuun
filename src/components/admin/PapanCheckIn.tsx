"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { cekIn, type HasilScan } from "@/app/admin/scan/actions";
import { jam, tanggalPendek } from "@/lib/format";

type PendeteksiKode = {
  detect: (sumber: CanvasImageSource) => Promise<{ rawValue: string }[]>;
};

function TombolCek() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="tombol-utama" disabled={pending}>
      {pending ? "Memeriksa..." : "Cek kode"}
    </button>
  );
}

function Hasil({ hasil }: { hasil: HasilScan }) {
  if (!hasil.keadaan) return null;

  const gaya: Record<HasilScan["keadaan"], string> = {
    kosong: "border-garis",
    "tidak-ada": "border-bahaya",
    "belum-bayar": "border-gold-ink",
    dibatalkan: "border-bahaya",
    "sudah-hadir": "border-gold-ink",
    berhasil: "border-sukses",
  };

  const judul: Record<HasilScan["keadaan"], string> = {
    kosong: "Kodenya belum diisi",
    "tidak-ada": "Kode tidak ditemukan",
    "belum-bayar": "Pembayaran belum dikonfirmasi",
    dibatalkan: "Tiket ini dibatalkan",
    "sudah-hadir": "Tiket ini sudah dipakai check-in",
    berhasil: "Silakan masuk",
  };

  return (
    <div role="status" aria-live="assertive" className={`mt-5 rounded-[12px] border-2 bg-paper p-4 ${gaya[hasil.keadaan]}`}>
      <p className="font-[family-name:var(--font-judul)] text-[clamp(1.3rem,6vw,1.8rem)] font-bold leading-tight">
        {judul[hasil.keadaan]}
      </p>
      {hasil.nama ? (
        <p className="mt-2 text-lg">
          {hasil.nama}, {hasil.jumlah} orang
        </p>
      ) : null}
      {hasil.acara ? <p className="text-ink-soft">{hasil.acara}</p> : null}
      {hasil.kode ? <p className="mt-2 kode-besar">{hasil.kode}</p> : null}
      {hasil.keadaan === "sudah-hadir" && hasil.waktuSebelumnya ? (
        <p className="mt-2">
          Tercatat hadir pada {tanggalPendek(hasil.waktuSebelumnya)}, {jam(hasil.waktuSebelumnya)}. Kalau memang
          rombongan yang sama, tidak perlu dicatat dua kali.
        </p>
      ) : null}
      {hasil.keadaan === "belum-bayar" ? (
        <p className="mt-2">Konfirmasi pembayarannya dulu di menu Pendaftar, baru tiket ini bisa dipakai.</p>
      ) : null}
      {hasil.keadaan === "tidak-ada" ? (
        <p className="mt-2">Periksa lagi hurufnya. Kode selalu diawali DZN dan empat karakter setelahnya.</p>
      ) : null}
    </div>
  );
}

export default function PapanCheckIn() {
  const [hasil, aksi] = useActionState<HasilScan, FormData>(cekIn, { keadaan: "kosong" });
  const [kamera, setKamera] = useState<"mati" | "nyala" | "tidak-didukung" | "ditolak">("mati");
  const video = useRef<HTMLVideoElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const isian = useRef<HTMLInputElement>(null);
  const aliran = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      aliran.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const nyalakanKamera = async () => {
    const pabrik = (window as unknown as { BarcodeDetector?: new (opsi: { formats: string[] }) => PendeteksiKode })
      .BarcodeDetector;
    if (!pabrik) {
      setKamera("tidak-didukung");
      return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      aliran.current = media;
      if (video.current) {
        video.current.srcObject = media;
        await video.current.play();
      }
      setKamera("nyala");

      const pendeteksi = new pabrik({ formats: ["qr_code"] });
      const periksa = async () => {
        if (!video.current || !aliran.current) return;
        try {
          const kode = await pendeteksi.detect(video.current);
          const nilai = kode[0]?.rawValue?.trim();
          if (nilai && isian.current && form.current) {
            isian.current.value = nilai.toUpperCase();
            aliran.current.getTracks().forEach((track) => track.stop());
            aliran.current = null;
            setKamera("mati");
            form.current.requestSubmit();
            return;
          }
        } catch {
          // Bingkai yang gagal dibaca diabaikan, pemindaian lanjut ke bingkai berikutnya.
        }
        window.setTimeout(periksa, 400);
      };
      void periksa();
    } catch {
      setKamera("ditolak");
    }
  };

  const matikanKamera = () => {
    aliran.current?.getTracks().forEach((track) => track.stop());
    aliran.current = null;
    setKamera("mati");
  };

  return (
    <div className="mt-6">
      <section>
        <h2 className="text-[1.15rem]">Ketik kode tiket</h2>
        <p className="mt-1 text-ink-soft">
          Jalur ini setara dengan kamera dan selalu bisa dipakai, termasuk di iPhone yang belum mendukung pemindaian
          bawaan peramban.
        </p>
        <form ref={form} action={aksi} className="mt-3 flex flex-wrap items-end gap-2">
          <div className="min-w-[200px] flex-1">
            <label className="label-isian" htmlFor="kode">
              Kode tiket
            </label>
            <input
              ref={isian}
              id="kode"
              name="kode"
              className="isian uppercase"
              placeholder="DZN-9F2M"
              autoComplete="off"
              autoCapitalize="characters"
            />
          </div>
          <TombolCek />
        </form>
      </section>

      <section className="mt-6">
        <h2 className="text-[1.15rem]">Pindai QR dengan kamera</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {kamera !== "nyala" ? (
            <button type="button" onClick={nyalakanKamera} className="tombol-kedua">
              Nyalakan kamera
            </button>
          ) : (
            <button type="button" onClick={matikanKamera} className="tombol-kedua">
              Matikan kamera
            </button>
          )}
        </div>

        {kamera === "tidak-didukung" ? (
          <p className="mt-2 rounded-[4px] border border-garis bg-paper p-3">
            Peramban di HP ini belum bisa memindai QR sendiri. Pakai kolom kode di atas, hasilnya sama.
          </p>
        ) : null}
        {kamera === "ditolak" ? (
          <p className="mt-2 rounded-[4px] border border-garis bg-paper p-3">
            Izin kamera belum diberikan. Beri izin lewat pengaturan peramban, atau pakai kolom kode di atas.
          </p>
        ) : null}

        <video
          ref={video}
          muted
          playsInline
          className={`mt-3 w-full max-w-[360px] rounded-[12px] border border-garis ${kamera === "nyala" ? "" : "hidden"}`}
        />
      </section>

      <Hasil hasil={hasil} />
    </div>
  );
}
