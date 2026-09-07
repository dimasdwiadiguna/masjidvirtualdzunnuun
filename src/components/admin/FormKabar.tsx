import Image from "next/image";
import FormAksi from "@/components/admin/FormAksi";
import { simpanKabar } from "@/app/admin/kabar/actions";
import { keInputWaktu } from "@/lib/format";
import type { Season, Update } from "@/lib/data/types";

type Props = {
  kabar?: Update;
  season: Season | null;
  hariOtomatis: number | null;
};

export default function FormKabar({ kabar, season, hariOtomatis }: Props) {
  const kunci = kabar?.id ?? "baru";
  return (
    <FormAksi aksi={simpanKabar} labelKirim={kabar ? "Simpan perubahan kabar" : "Terbitkan kabar"} className="max-w-[560px]">
      {kabar ? <input type="hidden" name="id" value={kabar.id} /> : null}
      <input type="hidden" name="season_id" value={kabar?.season_id ?? season?.id ?? ""} />

      <div>
        <label className="label-isian" htmlFor={`hari-${kunci}`}>
          Hari ke berapa
        </label>
        <input
          id={`hari-${kunci}`}
          name="day_number"
          type="number"
          min={0}
          defaultValue={kabar?.day_number ?? hariOtomatis ?? ""}
          className="isian"
        />
        <p className="mt-1 text-sm text-ink-soft">
          {hariOtomatis
            ? `Terisi otomatis dari tanggal mulai season aktif. Hari ini hari ke-${hariOtomatis}. Boleh diubah.`
            : "Belum ada season aktif, jadi nomor hari tidak terisi otomatis. Boleh dikosongkan."}
        </p>
      </div>

      <div>
        <label className="label-isian" htmlFor={`judul-kabar-${kunci}`}>
          Judul
        </label>
        <input
          id={`judul-kabar-${kunci}`}
          name="title"
          required
          defaultValue={kabar?.title ?? ""}
          className="isian"
          placeholder="Contoh: Air minum jamaah Subuh"
        />
      </div>

      <div>
        <label className="label-isian" htmlFor={`isi-${kunci}`}>
          Isi kabar
        </label>
        <textarea
          id={`isi-${kunci}`}
          name="body"
          rows={6}
          required
          defaultValue={kabar?.body ?? ""}
          className="isian"
          placeholder="Dua sampai empat kalimat. Tulis angka yang benar-benar terjadi, bukan perkiraan."
        />
      </div>

      <div>
        <span className="label-isian">Foto</span>
        {kabar?.image_url ? (
          <>
            <Image
              src={kabar.image_url}
              alt="Foto kabar yang sedang dipakai"
              width={320}
              height={240}
              className="h-auto w-[180px] rounded-[4px] border border-ink-soft"
            />
            <label className="mt-2 flex items-center gap-2 text-[0.95rem]">
              <input type="checkbox" name="hapus_gambar" value="ya" className="h-5 w-5 accent-[#8A1F1F]" />
              Hapus foto
            </label>
          </>
        ) : (
          <p className="text-ink-soft">Belum ada foto.</p>
        )}
        <input name="gambar" type="file" accept="image/jpeg,image/png,image/webp" className="isian mt-2 py-2" />
      </div>

      <div>
        <label className="label-isian" htmlFor={`terbit-${kunci}`}>
          Waktu terbit
        </label>
        <input
          id={`terbit-${kunci}`}
          name="published_at"
          type="datetime-local"
          defaultValue={keInputWaktu(kabar?.published_at ?? new Date().toISOString())}
          className="isian"
        />
      </div>

      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          name="is_published"
          value="ya"
          defaultChecked={kabar?.is_published ?? true}
          className="mt-1 h-5 w-5 accent-[#0A8074]"
        />
        <span>Tampilkan di halaman publik.</span>
      </label>
    </FormAksi>
  );
}
