import FormAksi from "./FormAksi";
import PilihGambar from "./PilihGambar";
import { simpanPengumuman } from "@/app/admin/pengumuman/actions";
import type { Announcement } from "@/lib/data/types";

type Props = { pengumuman?: Announcement; urutanBerikut: number };

export default function FormPengumuman({ pengumuman, urutanBerikut }: Props) {
  const kunci = pengumuman?.id ?? "baru";

  return (
    <FormAksi
      aksi={simpanPengumuman}
      labelKirim={pengumuman ? "Simpan perubahan pengumuman" : "Terbitkan pengumuman"}
    >
      {pengumuman ? <input type="hidden" name="id" value={pengumuman.id} /> : null}

      <div>
        <label className="label-isian" htmlFor={`judul-pengumuman-${kunci}`}>
          Judul
        </label>
        <input
          id={`judul-pengumuman-${kunci}`}
          name="title"
          type="text"
          required
          maxLength={80}
          defaultValue={pengumuman?.title ?? ""}
          className="isian"
          placeholder="Aturan Masjid Ngopi-Ngopi"
        />
        <p className="petunjuk">Dipakai sebagai judul halaman dan teks alternatif gambarnya.</p>
      </div>

      <PilihGambar
        name="gambar"
        kunci={kunci}
        label={pengumuman ? "Ganti gambar" : "Gambar pengumuman"}
        bantuan="Gambar tegak atau persegi paling enak dilihat di HP. Foto dari kamera otomatis dikecilkan dulu."
      />

      {pengumuman ? (
        <p className="petunjuk">
          Kalau tidak memilih gambar baru, gambar yang sekarang tetap dipakai.
        </p>
      ) : null}

      <div>
        <label className="label-isian" htmlFor={`isi-pengumuman-${kunci}`}>
          Keterangan (boleh dikosongkan)
        </label>
        <textarea
          id={`isi-pengumuman-${kunci}`}
          name="body"
          rows={5}
          defaultValue={pengumuman?.body ?? ""}
          className="isian"
          placeholder="Penjelasan singkat yang muncul di halaman pengumuman."
        />
        <p className="petunjuk">Kosongkan kalau gambarnya sudah menjelaskan sendiri.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-isian" htmlFor={`urutan-pengumuman-${kunci}`}>
            Urutan
          </label>
          <input
            id={`urutan-pengumuman-${kunci}`}
            name="sort_order"
            type="number"
            defaultValue={pengumuman?.sort_order ?? urutanBerikut}
            className="isian"
          />
          <p className="petunjuk">Angka kecil tampil lebih dulu.</p>
        </div>

        <div>
          <label className="label-isian" htmlFor={`alamat-pengumuman-${kunci}`}>
            Alamat halaman (boleh dikosongkan)
          </label>
          <input
            id={`alamat-pengumuman-${kunci}`}
            name="slug"
            type="text"
            defaultValue={pengumuman?.slug ?? ""}
            className="isian"
            placeholder="dibuat otomatis dari judul"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-[0.95rem]">
        <input
          type="checkbox"
          name="is_active"
          value="ya"
          defaultChecked={pengumuman ? pengumuman.is_active : true}
          className="h-5 w-5"
        />
        Tampilkan di beranda
      </label>
    </FormAksi>
  );
}
