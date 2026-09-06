export const UKURAN_OG = { width: 1200, height: 630 };
export const TIPE_OG = "image/png";

/**
 * Tata letak gambar pratinjau tautan. Distribusi utama app ini grup WhatsApp,
 * jadi yang harus terbaca di kartu kecil hanya label, judul, dan satu angka.
 */
export function KartuOg({
  label,
  judul,
  catatan,
}: {
  label: string;
  judul: string;
  catatan?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#043A43",
        color: "#F7F3EA",
        padding: "64px 72px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 30, color: "#C6B066", letterSpacing: 1 }}>{label}</div>
        <div
          style={{
            marginTop: 24,
            fontSize: judul.length > 60 ? 60 : 76,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 980,
          }}
        >
          {judul}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ fontSize: 32, maxWidth: 760, color: "#F7F3EA" }}>{catatan ?? ""}</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ fontSize: 34, fontWeight: 700 }}>Dzun Nuun</div>
          <div style={{ fontSize: 24, color: "#C6B066" }}>Masjid Fathul Ummah</div>
        </div>
      </div>
    </div>
  );
}
