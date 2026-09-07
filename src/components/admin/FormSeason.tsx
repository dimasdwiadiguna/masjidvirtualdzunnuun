import Image from "next/image";
import FormAksi from "@/components/admin/FormAksi";
import { simpanSeason } from "@/app/admin/season/actions";
import type { Season } from "@/lib/data/types";

export default function FormSeason({ season }: { season?: Season }) {
  return (
    <FormAksi
      aksi={simpanSeason}
      labelKirim={season ? "Simpan perubahan season" : "Buat season"}
      className="max-w-[560px]"
    >
      {season ? <input type="hidden" name="id" value={season.id} /> : null}

      <div>
        <label className="label-isian" htmlFor={`title-${season?.id ?? "baru"}`}>
          Judul season (boleh dikosongkan)
        </label>
        <input
          id={`title-${season?.id ?? "baru"}`}
          name="title"
          defaultValue={season?.title ?? ""}
          className="isian"
          placeholder="Belum dinamai juga tidak masalah"
        />
      </div>

      <div>
        <label className="label-isian" htmlFor={`slug-${season?.id ?? "baru"}`}>
          Alamat halaman
        </label>
        <input
          id={`slug-${season?.id ?? "baru"}`}
          name="slug"
          defaultValue={season?.slug ?? ""}
          className="isian"
          placeholder="season-1"
        />
      </div>

      <div>
        <label className="label-isian" htmlFor={`tagline-${season?.id ?? "baru"}`}>
          Kalimat pembuka
        </label>
        <input
          id={`tagline-${season?.id ?? "baru"}`}
          name="tagline"
          defaultValue={season?.tagline ?? ""}
          className="isian"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-isian" htmlFor={`target-${season?.id ?? "baru"}`}>
            Target dana (rupiah)
          </label>
          <input
            id={`target-${season?.id ?? "baru"}`}
            name="target_amount"
            type="number"
            min={1}
            defaultValue={season?.target_amount ?? 7000000}
            className="isian"
          />
        </div>
        <div>
          <label className="label-isian" htmlFor={`harga-${season?.id ?? "baru"}`}>
            Harga per paket
          </label>
          <input
            id={`harga-${season?.id ?? "baru"}`}
            name="package_price"
            type="number"
            min={1}
            defaultValue={season?.package_price ?? 15000}
            className="isian"
          />
        </div>
        <div>
          <label className="label-isian" htmlFor={`mulai-${season?.id ?? "baru"}`}>
            Tanggal mulai
          </label>
          <input
            id={`mulai-${season?.id ?? "baru"}`}
            name="start_date"
            type="date"
            required
            defaultValue={season?.start_date ?? ""}
            className="isian"
          />
        </div>
        <div>
          <label className="label-isian" htmlFor={`selesai-${season?.id ?? "baru"}`}>
            Tanggal selesai
          </label>
          <input
            id={`selesai-${season?.id ?? "baru"}`}
            name="end_date"
            type="date"
            required
            defaultValue={season?.end_date ?? ""}
            className="isian"
          />
        </div>
      </div>

      <div>
        <label className="label-isian" htmlFor={`deskripsi-${season?.id ?? "baru"}`}>
          Cerita season ini
        </label>
        <textarea
          id={`deskripsi-${season?.id ?? "baru"}`}
          name="description"
          rows={7}
          defaultValue={season?.description ?? ""}
          className="isian"
        />
      </div>

      <div>
        <span className="label-isian">Foto header</span>
        {season?.header_image_url ? (
          <>
            <Image
              src={season.header_image_url}
              alt="Foto header season yang sedang dipakai"
              width={480}
              height={270}
              className="h-auto w-[220px] rounded-[4px] border border-ink-soft"
            />
            <label className="mt-2 flex items-center gap-2 text-[0.95rem]">
              <input type="checkbox" name="hapus_header" value="ya" className="h-5 w-5 accent-[#8A1F1F]" />
              Hapus foto header
            </label>
          </>
        ) : (
          <p className="text-ink-soft">Belum ada foto header.</p>
        )}
        <input name="header" type="file" accept="image/jpeg,image/png,image/webp" className="isian mt-2 py-2" />
      </div>

      <div>
        <label className="label-isian" htmlFor={`dana-${season?.id ?? "baru"}`}>
          Ringkasan penggunaan dana (tampil di halaman arsip)
        </label>
        <textarea
          id={`dana-${season?.id ?? "baru"}`}
          name="fund_usage_summary"
          rows={5}
          defaultValue={season?.fund_usage_summary ?? ""}
          className="isian"
          placeholder="Isi setelah season selesai, dengan angka yang benar-benar terpakai."
        />
      </div>

      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          name="is_active"
          value="ya"
          defaultChecked={season?.is_active ?? false}
          className="mt-1 h-5 w-5 accent-[#0A8074]"
        />
        <span>Jadikan season aktif. Season aktif yang lama otomatis dinonaktifkan.</span>
      </label>
    </FormAksi>
  );
}
