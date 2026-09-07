/** Ditampilkan setelah form admin berhasil disimpan dan halaman dimuat ulang. */
export default function BannerTersimpan({ tampil }: { tampil: boolean }) {
  if (!tampil) return null;
  return (
    <p role="status" className="mt-4 rounded-[4px] border border-sukses bg-paper p-3 font-semibold text-sukses">
      Perubahan tersimpan.
    </p>
  );
}
