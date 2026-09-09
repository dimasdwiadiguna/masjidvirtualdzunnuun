import FormAksi from "@/components/admin/FormAksi";
import { catatDonasiManual, ubahDonasi } from "@/app/admin/donasi/actions";
import { rupiah } from "@/lib/format";
import type { Donation, Season } from "@/lib/data/types";

type Props = {
  /** Diisi untuk mode ubah. Kosong berarti mencatat donasi baru. */
  donasi?: Donation;
  season: Season | null;
  hargaPaket: number;
  /** Alamat daftar yang dituju setelah tersimpan. */
  alamatSukses: string;
};

/**
 * Satu formulir untuk dua pekerjaan: mencatat donasi yang masuk di luar
 * formulir publik, dan membetulkan donasi yang sudah ada.
 *
 * Isian nominal dipisah dari isian jumlah paket, dan itu disengaja. Uang yang
 * benar-benar masuk sering tidak persis sama dengan jumlah paket dikali harga:
 * ada yang membulatkan ke atas, ada yang menitipkan uang tunai. Yang menambah
 * angka di halaman publik adalah nominalnya, dan yang menghitung jamaah
 * dirangkul adalah jumlah paketnya, jadi keduanya perlu bisa diisi sendiri.
 *
 * Nominal yang bentrok adalah penolakan yang wajar terjadi di formulir ini,
 * jadi isian yang sudah diketik harus bertahan saat kiriman ditolak. Yang
 * menjaganya ada di FormAksi, yang membatalkan pengosongan formulir bawaan
 * React.
 */
export default function FormDonasiAdmin({ donasi, season, hargaPaket, alamatSukses }: Props) {
  const kunci = donasi?.id ?? "baru";
  const mengubah = Boolean(donasi);

  return (
    <FormAksi
      aksi={mengubah ? ubahDonasi : catatDonasiManual}
      labelKirim={mengubah ? "Simpan perubahan" : "Catat donasi"}
      className="max-w-[560px]"
      alamatSukses={alamatSukses}
    >
      {donasi ? <input type="hidden" name="id" value={donasi.id} /> : null}

      <div>
        <label className="label-isian" htmlFor={`nama-donatur-${kunci}`}>
          Nama donatur
        </label>
        <input
          id={`nama-donatur-${kunci}`}
          name="nama"
          required
          maxLength={60}
          defaultValue={donasi?.donor_name ?? ""}
          className="isian"
          placeholder="Contoh: Pak Hadi"
        />
      </div>

      <div>
        <label className="label-isian" htmlFor={`wa-donatur-${kunci}`}>
          Nomor WhatsApp (boleh dikosongkan)
        </label>
        <input
          id={`wa-donatur-${kunci}`}
          name="whatsapp"
          inputMode="numeric"
          defaultValue={donasi?.whatsapp ?? ""}
          className="isian"
          placeholder="081234567890"
        />
        <p className="petunjuk">Kosongkan kalau nomornya tidak ada. Tombol WhatsApp pada barisnya tidak akan muncul.</p>
      </div>

      <div>
        <label className="label-isian" htmlFor={`paket-${kunci}`}>
          Jumlah paket
        </label>
        <input
          id={`paket-${kunci}`}
          name="paket"
          type="number"
          min={1}
          max={2000}
          required
          defaultValue={donasi?.package_count ?? 1}
          className="isian"
        />
        <p className="petunjuk">Satu paket {rupiah(hargaPaket)}. Angka ini yang menghitung jamaah dirangkul.</p>
      </div>

      <div>
        <label className="label-isian" htmlFor={`nominal-${kunci}`}>
          Nominal yang masuk
        </label>
        <input
          id={`nominal-${kunci}`}
          name="nominal"
          type="number"
          min={1}
          step={1}
          defaultValue={donasi?.total_amount ?? ""}
          className="isian"
          placeholder={String(hargaPaket)}
        />
        <p className="petunjuk">
          Tanpa titik, misalnya 150000. Dikosongkan berarti dihitung dari jumlah paket. Angka ini yang menambah progress
          publik setelah terverifikasi.
        </p>
      </div>

      {mengubah ? null : (
        <fieldset>
          <legend className="label-isian">Keadaan uangnya</legend>
          <label className="flex min-h-[44px] items-start gap-2">
            <input type="radio" name="status" value="verified" defaultChecked className="mt-1 h-5 w-5" />
            <span>Sudah masuk. Langsung terverifikasi, progress publik naik sekarang juga.</span>
          </label>
          <label className="mt-1 flex min-h-[44px] items-start gap-2">
            <input type="radio" name="status" value="pending" className="mt-1 h-5 w-5" />
            <span>Belum masuk. Ikut daftar Menunggu, seperti donasi dari formulir publik.</span>
          </label>
        </fieldset>
      )}

      <div>
        <label className="label-isian" htmlFor={`catatan-donasi-${kunci}`}>
          Catatan pengurus (boleh dikosongkan)
        </label>
        <input
          id={`catatan-donasi-${kunci}`}
          name="catatan"
          maxLength={200}
          defaultValue={donasi?.admin_note ?? ""}
          className="isian"
          placeholder="Contoh: tunai, diterima Rian saat kajian Ahad"
        />
        <p className="petunjuk">Untuk sesama pengurus. Catatan penolakan ikut terbawa ke pesan WhatsApp.</p>
      </div>

      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          name="anonim"
          value="ya"
          defaultChecked={donasi?.is_anonymous ?? false}
          className="mt-1 h-5 w-5 accent-[#0A8074]"
        />
        <span>Sembunyikan namanya di halaman publik.</span>
      </label>

      {season ? null : (
        <p className="petunjuk text-bahaya">
          Belum ada season yang aktif. Aktifkan satu season dulu di menu Season sebelum mencatat donasi.
        </p>
      )}
    </FormAksi>
  );
}
