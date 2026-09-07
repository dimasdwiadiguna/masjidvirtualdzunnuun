import Image from "next/image";
import FormAksi from "@/components/admin/FormAksi";
import PilihGambar from "@/components/admin/PilihGambar";
import { simpanAcara } from "@/app/admin/acara/actions";
import { keInputWaktu } from "@/lib/format";
import type { EventItem } from "@/lib/data/types";

export default function FormAcara({ acara }: { acara?: EventItem }) {
  const kunci = acara?.id ?? "baru";
  return (
    <FormAksi aksi={simpanAcara} labelKirim={acara ? "Simpan perubahan acara" : "Buat acara"} className="max-w-[560px]">
      {acara ? <input type="hidden" name="id" value={acara.id} /> : null}

      <div>
        <label className="label-isian" htmlFor={`judul-${kunci}`}>
          Judul acara
        </label>
        <input id={`judul-${kunci}`} name="title" required defaultValue={acara?.title ?? ""} className="isian" />
      </div>

      <div>
        <label className="label-isian" htmlFor={`slug-acara-${kunci}`}>
          Alamat halaman (kosongkan untuk dibuat otomatis dari judul)
        </label>
        <input id={`slug-acara-${kunci}`} name="slug" defaultValue={acara?.slug ?? ""} className="isian" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-isian" htmlFor={`mulai-acara-${kunci}`}>
            Mulai
          </label>
          <input
            id={`mulai-acara-${kunci}`}
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={keInputWaktu(acara?.starts_at ?? null)}
            className="isian"
          />
        </div>
        <div>
          <label className="label-isian" htmlFor={`selesai-acara-${kunci}`}>
            Selesai (boleh dikosongkan)
          </label>
          <input
            id={`selesai-acara-${kunci}`}
            name="ends_at"
            type="datetime-local"
            defaultValue={keInputWaktu(acara?.ends_at ?? null)}
            className="isian"
          />
        </div>
      </div>
      <p className="-mt-2 text-sm text-ink-soft">Semua waktu dibaca sebagai waktu Jakarta.</p>

      <div>
        <label className="label-isian" htmlFor={`lokasi-${kunci}`}>
          Nama lokasi
        </label>
        <input
          id={`lokasi-${kunci}`}
          name="location_name"
          defaultValue={acara?.location_name ?? ""}
          className="isian"
          placeholder="Masjid Fathul Ummah"
        />
      </div>

      <div>
        <label className="label-isian" htmlFor={`peta-${kunci}`}>
          Link peta lokasi
        </label>
        <input id={`peta-${kunci}`} name="location_map_url" defaultValue={acara?.location_map_url ?? ""} className="isian" />
      </div>

      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          name="is_paid"
          value="ya"
          defaultChecked={acara?.is_paid ?? false}
          className="mt-1 h-5 w-5 accent-[#0A8074]"
        />
        <span>Acara berbayar. Kalau dicentang, isi harganya di bawah.</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-isian" htmlFor={`harga-acara-${kunci}`}>
            Harga per orang
          </label>
          <input
            id={`harga-acara-${kunci}`}
            name="price"
            type="number"
            min={0}
            defaultValue={acara?.price ?? 0}
            className="isian"
          />
        </div>
        <div>
          <label className="label-isian" htmlFor={`kuota-${kunci}`}>
            Kuota (kosongkan kalau tanpa batas)
          </label>
          <input
            id={`kuota-${kunci}`}
            name="capacity"
            type="number"
            min={1}
            defaultValue={acara?.capacity ?? ""}
            className="isian"
          />
        </div>
      </div>

      <div>
        <label className="label-isian" htmlFor={`tenggat-${kunci}`}>
          Pendaftaran ditutup pada
        </label>
        <input
          id={`tenggat-${kunci}`}
          name="registration_deadline"
          type="datetime-local"
          defaultValue={keInputWaktu(acara?.registration_deadline ?? null)}
          className="isian"
        />
      </div>

      <div>
        <label className="label-isian" htmlFor={`rutin-${kunci}`}>
          Catatan rutin
        </label>
        <input
          id={`rutin-${kunci}`}
          name="is_recurring_note"
          defaultValue={acara?.is_recurring_note ?? ""}
          className="isian"
          placeholder="Setiap Ahad ba'da Subuh"
        />
      </div>

      <div>
        <label className="label-isian" htmlFor={`deskripsi-acara-${kunci}`}>
          Keterangan acara
        </label>
        <textarea
          id={`deskripsi-acara-${kunci}`}
          name="description"
          rows={6}
          defaultValue={acara?.description ?? ""}
          className="isian"
        />
      </div>

      <div>
        <span className="label-isian">Poster</span>
        {acara?.poster_url ? (
          <>
            <Image
              src={acara.poster_url}
              alt="Poster acara yang sedang dipakai"
              width={320}
              height={400}
              className="h-auto w-[160px] rounded-[4px] border border-garis"
            />
            <label className="mt-2 flex items-center gap-2 text-[0.95rem]">
              <input type="checkbox" name="hapus_poster" value="ya" className="h-5 w-5 accent-[#8A1F1F]" />
              Hapus poster
            </label>
          </>
        ) : (
          <p className="text-ink-soft">Belum ada poster.</p>
        )}
        <PilihGambar name="poster" label="Unggah poster baru" bantuan="Poster tegak lebih pas di layar HP." />
      </div>

      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          name="is_published"
          value="ya"
          defaultChecked={acara?.is_published ?? false}
          className="mt-1 h-5 w-5 accent-[#0A8074]"
        />
        <span>Terbitkan acara ini di halaman publik.</span>
      </label>
    </FormAksi>
  );
}
