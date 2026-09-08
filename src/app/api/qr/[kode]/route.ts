import QRCode from "qrcode";

/**
 * Gambar QR tiket, supaya pengurus bisa menempelkan tautannya di pesan
 * WhatsApp. wa.me hanya bisa mengisi teks, tidak bisa melampirkan berkas.
 *
 * Rute ini sengaja tidak menyentuh database. Kodenya hanya diperiksa
 * bentuknya lalu digambar, jadi tidak ada yang bisa memakai alamat ini untuk
 * menebak kode mana yang benar-benar ada, dan tidak ada nama atau nominal
 * yang bisa bocor lewat sini.
 *
 * Isi QR tetap kode telanjang, bukan alamat halaman. PapanCheckIn menulis
 * hasil pindaian langsung ke kolom kode, jadi mengisinya dengan URL akan
 * merusak check-in lewat kamera.
 */
const BENTUK_KODE = /^DZN-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/;

type Props = { params: Promise<{ kode: string }> };

export async function GET(_permintaan: Request, { params }: Props) {
  const { kode } = await params;
  const bersih = decodeURIComponent(kode).replace(/\.png$/i, "").toUpperCase();

  if (!BENTUK_KODE.test(bersih)) {
    return new Response("Kode tiket tidak berbentuk DZN-XXXX.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const gambar = await QRCode.toBuffer(bersih, {
    width: 640,
    margin: 2,
    color: { dark: "#06232A", light: "#FFFDF7" },
    errorCorrectionLevel: "M",
  });

  return new Response(new Uint8Array(gambar), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Robots-Tag": "noindex",
    },
  });
}
