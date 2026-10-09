"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { cekIn, type HasilScan } from "@/app/admin/scan/actions";
import { jam, tanggalPendek } from "@/lib/format";

type PendeteksiKode = {
  detect: (sumber: CanvasImageSource) => Promise<{ rawValue: string }[]>;
};

type BacaKanvas = (
  data: Uint8ClampedArray,
  lebar: number,
  tinggi: number,
  opsi?: { inversionAttempts?: "dontInvert" | "attemptBoth" },
) => { data: string } | null;

type KeadaanKamera = "mati" | "menyiapkan" | "nyala" | "tidak-aman" | "ditolak" | "gagal";

/** Kode tiket di dalam QR. Pola yang sama dengan buatKode di server. */
const POLA_KODE = /DZN-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}/;

/** Jeda antar bingkai yang dibaca. Cukup cepat terasa langsung, cukup lambat supaya HP tidak panas. */
const JEDA_PINDAI = 250;

/** Kode yang sama diabaikan selama ini, supaya satu tiket tidak terkirim belasan kali. */
const JEDA_KODE_SAMA = 5000;

/** Sisi terpanjang bingkai yang dibaca jsQR. Lebih besar tidak menambah akurasi, hanya beban. */
const SISI_BACA = 480;

/**
 * Kode di dalam QR tiket adalah kode telanjang, tetapi QR yang dibuat orang
 * lain bisa berisi alamat halaman. Kodenya dicari di dalam teks apa pun supaya
 * keduanya sama-sama jalan, dan QR yang bukan tiket ditolak di perangkat tanpa
 * menghubungi server.
 */
function kodeDariQr(teks: string): string | null {
  return teks.toUpperCase().match(POLA_KODE)?.[0] ?? null;
}

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
  const [hasil, aksi, memproses] = useActionState<HasilScan, FormData>(cekIn, { keadaan: "kosong" });
  const [kamera, setKamera] = useState<KeadaanKamera>("mati");
  const [catatan, setCatatan] = useState<string | null>(null);
  const [lampu, setLampu] = useState<"tidak-ada" | "mati" | "nyala">("tidak-ada");
  const [jumlahKamera, setJumlahKamera] = useState(0);

  const video = useRef<HTMLVideoElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const isian = useRef<HTMLInputElement>(null);

  const aliran = useRef<MediaStream | null>(null);
  const detektor = useRef<PendeteksiKode | null>(null);
  const bacaKanvas = useRef<BacaKanvas | null>(null);
  const kanvas = useRef<HTMLCanvasElement | null>(null);
  const jadwal = useRef<number | null>(null);
  const mencari = useRef(false);
  const sibuk = useRef(false);
  const terakhir = useRef<{ kode: string; waktu: number } | null>(null);
  const perangkat = useRef<string[]>([]);
  const dipakai = useRef(0);
  const bunyi = useRef<AudioContext | null>(null);

  // Loop pindai berjalan di luar React, jadi keadaan "sedang memproses" perlu
  // salinan di ref. Tanpa ini loop membaca nilai dari render pertama terus.
  useEffect(() => {
    sibuk.current = memproses;
  }, [memproses]);

  /**
   * Nada pendek saat ada kode terbaca. Panitia memegang HP sambil menyapa
   * orang, jadi hasilnya perlu terdengar, bukan hanya terlihat. Dibuat dengan
   * oscillator supaya tidak ada berkas audio yang perlu diunduh.
   */
  const berbunyi = useCallback((nada: "baik" | "ragu") => {
    const konteks = bunyi.current;
    if (!konteks) return;
    try {
      const osilator = konteks.createOscillator();
      const keras = konteks.createGain();
      osilator.type = "sine";
      osilator.frequency.value = nada === "baik" ? 880 : 420;
      keras.gain.value = 0.08;
      osilator.connect(keras).connect(konteks.destination);
      osilator.start();
      osilator.stop(konteks.currentTime + (nada === "baik" ? 0.12 : 0.3));
    } catch {
      // Perangkat yang menolak memutar nada tetap menampilkan hasil di layar.
    }
  }, []);

  const hentikanLoop = useCallback(() => {
    mencari.current = false;
    if (jadwal.current !== null) {
      window.clearTimeout(jadwal.current);
      jadwal.current = null;
    }
  }, []);

  const matikanKamera = useCallback(() => {
    hentikanLoop();
    aliran.current?.getTracks().forEach((track) => track.stop());
    aliran.current = null;
    if (video.current) video.current.srcObject = null;
    setLampu("tidak-ada");
    setKamera("mati");
  }, [hentikanLoop]);

  useEffect(() => matikanKamera, [matikanKamera]);

  /** Satu bingkai dibaca lewat kanvas kecil. Dipakai jsQR, yang menerima piksel mentah. */
  const bacaBingkai = useCallback((sumber: HTMLVideoElement): string | null => {
    const baca = bacaKanvas.current;
    if (!baca || !sumber.videoWidth) return null;
    if (!kanvas.current) kanvas.current = document.createElement("canvas");
    const papan = kanvas.current;
    const skala = Math.min(1, SISI_BACA / Math.max(sumber.videoWidth, sumber.videoHeight));
    papan.width = Math.round(sumber.videoWidth * skala);
    papan.height = Math.round(sumber.videoHeight * skala);
    const kuas = papan.getContext("2d", { willReadFrequently: true });
    if (!kuas) return null;
    kuas.drawImage(sumber, 0, 0, papan.width, papan.height);
    const piksel = kuas.getImageData(0, 0, papan.width, papan.height);
    return baca(piksel.data, piksel.width, piksel.height, { inversionAttempts: "dontInvert" })?.data ?? null;
  }, []);

  const tanganiBacaan = useCallback(
    (mentah: string) => {
      const kode = kodeDariQr(mentah);
      if (!kode) {
        setCatatan("QR itu terbaca, tetapi isinya bukan kode tiket Dzun Nuun.");
        berbunyi("ragu");
        terakhir.current = { kode: mentah, waktu: Date.now() };
        return;
      }
      const sekarang = Date.now();
      if (terakhir.current?.kode === kode && sekarang - terakhir.current.waktu < JEDA_KODE_SAMA) return;
      terakhir.current = { kode, waktu: sekarang };
      setCatatan(null);
      berbunyi("baik");
      navigator.vibrate?.(60);
      if (isian.current && form.current) {
        isian.current.value = kode;
        form.current.requestSubmit();
      }
    },
    [berbunyi],
  );

  /**
   * Loop pindai. Kamera sengaja tidak dimatikan setelah satu tiket terbaca:
   * di pintu masuk orangnya datang berurutan, dan menekan tombol nyalakan
   * ulang untuk tiap orang membuat barisan menumpuk.
   */
  const mulaiLoop = useCallback(() => {
    if (mencari.current) return;
    mencari.current = true;

    const langkah = async () => {
      if (!mencari.current) return;
      const sumber = video.current;
      if (sumber && sumber.readyState >= 2 && !sibuk.current && !document.hidden) {
        let mentah: string | null = null;
        if (detektor.current) {
          try {
            mentah = (await detektor.current.detect(sumber))[0]?.rawValue?.trim() ?? null;
          } catch {
            // Bingkai yang gagal dibaca diabaikan, lanjut ke bingkai berikutnya.
          }
        } else {
          mentah = bacaBingkai(sumber);
        }
        if (mentah) tanganiBacaan(mentah);
      }
      if (!mencari.current) return;
      jadwal.current = window.setTimeout(langkah, JEDA_PINDAI);
    };

    void langkah();
  }, [bacaBingkai, tanganiBacaan]);

  /**
   * Menyiapkan pembaca QR.
   *
   * BarcodeDetector bawaan peramban dipakai kalau ada, karena jauh lebih ringan
   * dan memakai pemercepat perangkat. Safari di iPhone dan Firefox belum
   * punya, dan panitia memang sering memakai HP seadanya, jadi ada pembaca
   * cadangan yang berjalan di JavaScript. Pembaca cadangan itu diunduh hanya
   * saat dibutuhkan, jadi halaman ini tetap ringan di HP yang punya bawaan.
   */
  const siapkanPembaca = useCallback(async () => {
    const pabrik = (window as unknown as { BarcodeDetector?: new (opsi: { formats: string[] }) => PendeteksiKode })
      .BarcodeDetector;
    if (pabrik) {
      try {
        detektor.current = new pabrik({ formats: ["qr_code"] });
        return true;
      } catch {
        detektor.current = null;
      }
    }
    if (bacaKanvas.current) return true;
    try {
      const modul = await import("jsqr");
      bacaKanvas.current = modul.default as unknown as BacaKanvas;
      return true;
    } catch {
      return false;
    }
  }, []);

  const sambungkan = useCallback(
    async (deviceId?: string) => {
      const media = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: "environment" } },
      });
      aliran.current?.getTracks().forEach((track) => track.stop());
      aliran.current = media;
      if (video.current) {
        video.current.srcObject = media;
        await video.current.play();
      }

      // Lampu kilat hanya ada di sebagian HP. Di pintu masuk masjid saat malam,
      // ini yang membuat QR di layar redup tetap terbaca.
      const jalur = media.getVideoTracks()[0];
      const kemampuan = jalur?.getCapabilities?.() as { torch?: boolean } | undefined;
      setLampu(kemampuan?.torch ? "mati" : "tidak-ada");

      // Daftar kamera baru punya label dan id setelah izin diberikan.
      try {
        const daftar = await navigator.mediaDevices.enumerateDevices();
        perangkat.current = daftar.filter((satu) => satu.kind === "videoinput").map((satu) => satu.deviceId);
        setJumlahKamera(perangkat.current.length);
      } catch {
        setJumlahKamera(0);
      }
    },
    [],
  );

  const nyalakanKamera = async () => {
    setCatatan(null);

    // Kamera hanya bisa diminta di halaman https. Tanpa pesan ini, pengurus
    // hanya melihat tombol yang seperti tidak bereaksi.
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setKamera("tidak-aman");
      return;
    }

    setKamera("menyiapkan");
    // Konteks audio dibuat di dalam tap tombol, satu-satunya saat peramban
    // mengizinkannya berbunyi tanpa diblokir.
    if (!bunyi.current) {
      const Pabrik = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Pabrik) {
        try {
          bunyi.current = new Pabrik();
        } catch {
          bunyi.current = null;
        }
      }
    }
    await bunyi.current?.resume().catch(() => undefined);

    if (!(await siapkanPembaca())) {
      setKamera("gagal");
      setCatatan("Pembaca QR gagal dimuat. Pakai kolom kode di atas, hasilnya sama.");
      return;
    }

    try {
      await sambungkan();
      setKamera("nyala");
      mulaiLoop();
    } catch (galat) {
      const nama = galat instanceof Error ? galat.name : "";
      setKamera(nama === "NotAllowedError" || nama === "SecurityError" ? "ditolak" : "gagal");
    }
  };

  const gantiKamera = async () => {
    if (perangkat.current.length < 2) return;
    dipakai.current = (dipakai.current + 1) % perangkat.current.length;
    hentikanLoop();
    try {
      await sambungkan(perangkat.current[dipakai.current]);
      mulaiLoop();
    } catch {
      setKamera("gagal");
    }
  };

  const gantiLampu = async () => {
    const jalur = aliran.current?.getVideoTracks()[0];
    if (!jalur) return;
    const mau = lampu !== "nyala";
    try {
      await jalur.applyConstraints({ advanced: [{ torch: mau }] } as unknown as MediaTrackConstraints);
      setLampu(mau ? "nyala" : "mati");
    } catch {
      setLampu("tidak-ada");
    }
  };

  return (
    <div className="mt-6">
      <section>
        <h2 className="text-[1.15rem]">Ketik kode tiket</h2>
        <p className="mt-1 text-ink-soft">
          Jalur ini setara dengan kamera dan selalu bisa dipakai, termasuk saat kamera HP panitia sedang rewel.
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
        <p className="mt-1 text-ink-soft">
          Kamera tetap menyala setelah satu tiket terbaca, jadi orang berikutnya bisa langsung maju. Tiap bacaan
          berbunyi pendek supaya panitia tidak perlu menatap layar terus.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {kamera !== "nyala" ? (
            <button
              type="button"
              onClick={nyalakanKamera}
              className="tombol-kedua"
              disabled={kamera === "menyiapkan"}
            >
              {kamera === "menyiapkan" ? "Menyiapkan kamera..." : "Nyalakan kamera"}
            </button>
          ) : (
            <>
              <button type="button" onClick={matikanKamera} className="tombol-kedua">
                Matikan kamera
              </button>
              {lampu !== "tidak-ada" ? (
                <button type="button" onClick={gantiLampu} className="tombol-kecil" aria-pressed={lampu === "nyala"}>
                  {lampu === "nyala" ? "Matikan lampu" : "Nyalakan lampu"}
                </button>
              ) : null}
              {jumlahKamera > 1 ? (
                <button type="button" onClick={gantiKamera} className="tombol-kecil">
                  Ganti kamera
                </button>
              ) : null}
            </>
          )}
        </div>

        {kamera === "tidak-aman" ? (
          <p className="mt-2 rounded-[4px] border border-garis bg-paper p-3">
            Kamera hanya bisa dipakai kalau halaman ini dibuka lewat https. Buka panel lewat alamat resminya, bukan
            lewat alamat IP di jaringan lokal, atau pakai kolom kode di atas.
          </p>
        ) : null}
        {kamera === "ditolak" ? (
          <p className="mt-2 rounded-[4px] border border-garis bg-paper p-3">
            Izin kamera belum diberikan. Beri izin lewat ikon kunci di bilah alamat peramban, lalu nyalakan lagi.
            Kolom kode di atas tetap bisa dipakai sekarang.
          </p>
        ) : null}
        {kamera === "gagal" ? (
          <p className="mt-2 rounded-[4px] border border-garis bg-paper p-3">
            Kamera tidak bisa dibuka di HP ini. Mungkin sedang dipakai aplikasi lain. Tutup aplikasi kamera, lalu coba
            lagi, atau pakai kolom kode di atas.
          </p>
        ) : null}
        {catatan ? (
          <p role="status" aria-live="polite" className="mt-2 rounded-[4px] border border-gold-ink bg-paper p-3">
            {catatan}
          </p>
        ) : null}

        <div className={`mt-3 ${kamera === "nyala" ? "" : "hidden"}`}>
          <div className="relative w-full max-w-[360px]">
            <video ref={video} muted playsInline className="w-full rounded-[12px] border border-garis" />
            {/* Kotak bidik. Bukan hiasan: tanpa penanda, panitia cenderung
                menjauhkan HP sampai QR terlalu kecil untuk terbaca. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-[12px] border-2 border-gold"
            />
          </div>
          <p className="petunjuk">
            Arahkan QR tiket ke dalam kotak, sekitar sejengkal dari kamera.
            {memproses ? " Sedang memeriksa tiket..." : ""}
          </p>
        </div>
      </section>

      <Hasil hasil={hasil} />
    </div>
  );
}
