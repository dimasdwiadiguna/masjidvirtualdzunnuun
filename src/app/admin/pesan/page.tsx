import type { Metadata } from "next";
import BannerTersimpan from "@/components/admin/BannerTersimpan";
import FormAksi from "@/components/admin/FormAksi";
import SalinTeks from "@/components/SalinTeks";
import { db } from "@/lib/data";
import { peranSekarang } from "@/lib/admin";
import { TEMPLAT, contohPesan, periksaTemplat, templatDari, templatTersimpan } from "@/lib/pesan-wa";
import { simpanTemplatPesan } from "./actions";

export const metadata: Metadata = { title: "Pesan WhatsApp", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ tersimpan?: string }> };

export default async function AdminPesan({ searchParams }: Props) {
  const { tersimpan } = await searchParams;
  const [pengaturan, peran] = await Promise.all([(await db()).getSettings(), peranSekarang()]);
  // Dua hal yang berbeda dan keduanya perlu ditampilkan: teks yang benar-benar
  // dipakai tombol WhatsApp, dan teks yang tersimpan apa adanya termasuk yang
  // isiannya masih salah tulis, supaya pengurus bisa membetulkannya.
  const teks = templatDari(pengaturan);
  const tersimpanSendiri = templatTersimpan(pengaturan);
  const masalah = TEMPLAT.flatMap((templat) => periksaTemplat(templat.id, tersimpanSendiri[templat.id] ?? ""));
  const bolehMenyunting = peran === "admin";

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Pesan WhatsApp</h1>
      <p className="mt-1 text-ink-soft">
        Jamaah tidak punya halaman status. Semua kabar sampai lewat WhatsApp, dikirim Anda sendiri. Ini kata-katanya,
        dan di sini tempat mengubahnya.
      </p>

      <BannerTersimpan tampil={Boolean(tersimpan)} />

      <div className="kartu mt-5 bg-cream p-4">
        <h2 className="text-base">Satu tempat untuk semua kata-katanya</h2>
        <p className="petunjuk">
          Tombol WhatsApp di menu Donasi, Pendaftar, dan Jamaah Loyal memakai teks dari halaman ini. Ubah sekali di
          sini, semua pesan setelahnya ikut berubah.
        </p>
        <p className="petunjuk">
          Kurung kurawal seperti <code>{"{nama}"}</code> diganti data orangnya saat pesan dibuka.{" "}
          <strong>Baris yang isiannya kosong hilang sendiri</strong>, jadi taruh isian yang belum tentu ada, misalnya{" "}
          <code>{"{catatan}"}</code> dan <code>{"{tempat}"}</code>, di barisnya sendiri.
        </p>
        <p className="petunjuk">
          Kotak yang dikosongkan, atau yang kotak &quot;kembalikan ke teks bawaan&quot;-nya dicentang, kembali memakai
          kata-kata bawaan app.
        </p>
      </div>

      {masalah.length > 0 ? (
        <div className="kartu mt-5 border-bahaya p-4">
          <h2 className="text-base text-bahaya">Ada pesan yang belum bisa dipakai</h2>
          <p className="petunjuk">
            Suntingannya tersimpan dan tidak hilang, tetapi selama masalahnya belum dibetulkan, pesan itu dikirim
            memakai teks bawaan supaya jamaah tidak menerima kalimat yang isiannya salah tulis.
          </p>
          <ul className="mt-2 grid gap-1 text-sm text-bahaya">
            {masalah.map((satu) => (
              <li key={satu}>{satu}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {bolehMenyunting ? (
        <FormAksi aksi={simpanTemplatPesan} labelKirim="Simpan semua pesan" className="mt-6">
          {TEMPLAT.map((templat) => {
            const disunting = tersimpanSendiri[templat.id];
            const galat = periksaTemplat(templat.id, disunting ?? "");
            const dipakai = teks[templat.id];
            const diubah = Boolean(disunting) && galat.length === 0;
            return (
              <section key={templat.id} className="kartu p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-[1.05rem]">{templat.judul}</h2>
                  <span
                    className={`label-status ${galat.length > 0 ? "status-bahaya" : diubah ? "status-baik" : "status-diam"}`}
                  >
                    {galat.length > 0 ? "Belum dipakai" : diubah ? "Kata-kata Anda" : "Teks bawaan"}
                  </span>
                </div>
                <p className="petunjuk">{templat.kapan}</p>

                <label className="label-isian mt-3" htmlFor={`teks_${templat.id}`}>
                  Isi pesan
                </label>
                <textarea
                  id={`teks_${templat.id}`}
                  name={`teks_${templat.id}`}
                  rows={Math.min(16, (disunting ?? dipakai).split("\n").length + 2)}
                  defaultValue={disunting ?? dipakai}
                  className="isian font-[family-name:var(--font-isi)]"
                />
                {galat.length > 0 ? (
                  <ul role="alert" className="mt-1 grid gap-1 text-sm text-bahaya">
                    {galat.map((satu) => (
                      <li key={satu}>{satu}</li>
                    ))}
                  </ul>
                ) : null}

                <p className="petunjuk">Isian yang bisa dipakai di pesan ini:</p>
                <ul className="mt-1 grid gap-1 text-sm text-ink-soft">
                  {templat.medan.map((medan) => (
                    <li key={medan.kunci}>
                      <code className="font-semibold text-ink">{`{${medan.kunci}}`}</code> — {medan.arti}
                    </li>
                  ))}
                </ul>

                <label className="mt-3 flex min-h-[44px] items-center gap-2">
                  <input type="checkbox" name={`bawaan_${templat.id}`} value="ya" className="h-5 w-5" />
                  <span>Kembalikan ke teks bawaan saat disimpan</span>
                </label>

                <details className="mt-2">
                  <summary className="min-h-[44px] cursor-pointer py-2 font-semibold">
                    Lihat pratinjau dan teks bawaan
                  </summary>
                  <p className="petunjuk mt-2">
                    Pratinjau memakai data contoh, bukan data jamaah sungguhan. Yang tampil adalah pesan yang
                    benar-benar dikirim sekarang, jadi tekan Simpan dulu untuk melihat hasil suntingan Anda.
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap break-words rounded-[8px] bg-cream p-3 font-[family-name:var(--font-isi)] text-[0.9rem]">
                    {contohPesan(templat, dipakai)}
                  </pre>
                  <SalinTeks
                    teks={contohPesan(templat, dipakai)}
                    label="Salin pratinjau"
                    labelSelesai="Pratinjau tersalin"
                    className="mt-3 block"
                  />
                  {diubah ? (
                    <>
                      <p className="petunjuk mt-3">Teks bawaan app, kalau Anda ingin membandingkan:</p>
                      <pre className="mt-2 whitespace-pre-wrap break-words rounded-[8px] border border-garis p-3 font-[family-name:var(--font-isi)] text-[0.9rem]">
                        {templat.bawaan}
                      </pre>
                    </>
                  ) : null}
                </details>
              </section>
            );
          })}
        </FormAksi>
      ) : (
        <div className="mt-6 grid gap-4">
          <p className="text-ink-soft">
            Mengubah kata-katanya hanya bisa dilakukan pemegang password superadmin. Yang di bawah ini pesan yang
            berlaku sekarang, berikut tombol salin kalau Anda mengirim dari perangkat lain.
          </p>
          {TEMPLAT.map((templat) => (
            <section key={templat.id} className="kartu p-4">
              <h2 className="text-[1.05rem]">{templat.judul}</h2>
              <p className="petunjuk">{templat.kapan}</p>
              <pre className="mt-3 whitespace-pre-wrap break-words rounded-[8px] bg-cream p-3 font-[family-name:var(--font-isi)] text-[0.9rem]">
                {contohPesan(templat, teks[templat.id])}
              </pre>
              <SalinTeks
                teks={contohPesan(templat, teks[templat.id])}
                label="Salin pesan"
                labelSelesai="Pesan tersalin"
                className="mt-3 block"
              />
            </section>
          ))}
        </div>
      )}

      <div className="kartu mt-6 p-4">
        <h2 className="text-base">Kenapa tidak terkirim otomatis</h2>
        <p className="petunjuk">
          Alur manual ini disengaja. Pengiriman otomatis butuh WhatsApp Business API berbayar dan nomor terdaftar, dan
          pesan dari pengurus sungguhan lebih dipercaya jamaah daripada pesan robot. Anda tetap bisa mengubah
          kalimatnya di WhatsApp sebelum menekan kirim.
        </p>
      </div>
    </div>
  );
}
