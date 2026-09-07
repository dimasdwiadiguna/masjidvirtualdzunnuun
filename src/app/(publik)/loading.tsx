/**
 * Tinggi minimalnya dipasang supaya footer tidak melompat saat isi halaman
 * selesai diambil. Tanpa itu, footer sempat naik ke tengah layar lalu turun
 * lagi, dan pergeseran itu terbaca sebagai layout shift yang besar.
 */
export default function SedangMemuat() {
  return (
    <div className="kolom-isi flex min-h-[80vh] items-start py-16" role="status" aria-live="polite">
      <p className="text-ink-soft">Sedang mengambil data terbaru...</p>
    </div>
  );
}
