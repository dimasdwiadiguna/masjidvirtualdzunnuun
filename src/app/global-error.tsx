"use client";

/**
 * Jaring terakhir untuk galat yang terjadi di layout paling luar. Halaman ini
 * merender kerangka HTML-nya sendiri, jadi gayanya ditulis inline.
 */
export default function GalatGlobal({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#F7F3EA",
          color: "#06232A",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          lineHeight: 1.6,
          padding: "48px 16px",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.6rem", lineHeight: 1.2, margin: 0 }}>App sedang tidak bisa dibuka</h1>
          <p style={{ marginTop: 16 }}>
            Halaman gagal dimuat dari sisi server. Biasanya ini karena sambungan ke database belum benar, bukan karena
            perangkat Anda.
          </p>
          <p style={{ marginTop: 12 }}>
            Kalau Anda pengurus, buka <strong>/admin/diagnosa</strong> untuk melihat bagian mana yang bermasalah.
          </p>
          {error.digest ? (
            <p style={{ marginTop: 12, fontSize: "0.9rem", color: "#47615F" }}>Kode galat: {error.digest}</p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              minHeight: 48,
              padding: "12px 20px",
              borderRadius: 14,
              border: "none",
              backgroundColor: "#0A8074",
              color: "#FFFDF7",
              fontSize: "1rem",
              fontWeight: 600,
              boxShadow: "3px 3px 0 #06232A",
            }}
          >
            Coba muat ulang
          </button>
        </div>
      </body>
    </html>
  );
}
