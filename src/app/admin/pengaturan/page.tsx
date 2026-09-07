import type { Metadata } from "next";
import Image from "next/image";
import BannerTersimpan from "@/components/admin/BannerTersimpan";
import FormAksi from "@/components/admin/FormAksi";
import { db } from "@/lib/data";
import { PLACEHOLDER_WA } from "@/lib/data/seed";
import { simpanPengaturan } from "./actions";

export const metadata: Metadata = { title: "Pengaturan", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ tersimpan?: string }> };

export default async function AdminPengaturan({ searchParams }: Props) {
  const { tersimpan } = await searchParams;
  const pengaturan = await (await db()).getSettings();
  const nomorTampil = pengaturan.admin_whatsapp === PLACEHOLDER_WA ? "" : pengaturan.admin_whatsapp;

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Pengaturan</h1>
      <p className="mt-1 text-ink-soft">
        Satu QRIS, satu nomor WhatsApp, dan link sosial dipakai di seluruh app. Perubahan di sini langsung terlihat di
        halaman publik.
      </p>

      <BannerTersimpan tampil={Boolean(tersimpan)} />

      <FormAksi aksi={simpanPengaturan} labelKirim="Simpan pengaturan" className="mt-6 max-w-[560px]">
        <div>
          <label className="label-isian" htmlFor="admin_whatsapp">
            Nomor WhatsApp pengurus
          </label>
          <input
            id="admin_whatsapp"
            name="admin_whatsapp"
            defaultValue={nomorTampil}
            required
            className="isian"
            placeholder="081234567890"
            aria-describedby="bantuan-nomor"
          />
          <p id="bantuan-nomor" className="mt-1 text-sm text-ink-soft">
            Nomor ini yang dituju tombol konfirmasi donasi. Boleh ditulis 08, +62, atau 62.
          </p>
        </div>

        <div>
          <span className="label-isian">Gambar QRIS</span>
          {pengaturan.qris_image_url ? (
            <>
              <Image
                src={pengaturan.qris_image_url}
                alt="QRIS yang sedang dipakai"
                width={320}
                height={320}
                className="h-auto w-[180px] rounded-[4px] border border-ink-soft"
              />
              <label className="mt-2 flex items-center gap-2 text-[0.95rem]">
                <input type="checkbox" name="hapus_qris" value="ya" className="h-5 w-5 accent-[#8A1F1F]" />
                Hapus QRIS yang sekarang
              </label>
            </>
          ) : (
            <p className="text-ink-soft">Belum ada QRIS terpasang.</p>
          )}
          <input
            id="qris"
            name="qris"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="isian mt-2 py-2"
          />
          <p className="mt-1 text-sm text-ink-soft">JPG, PNG, atau WebP, maksimal 3 MB.</p>
        </div>

        <div>
          <label className="label-isian" htmlFor="whatsapp_channel_url">
            Link Saluran WhatsApp
          </label>
          <input
            id="whatsapp_channel_url"
            name="whatsapp_channel_url"
            defaultValue={pengaturan.whatsapp_channel_url ?? ""}
            className="isian"
            placeholder="https://whatsapp.com/channel/..."
          />
          <p className="mt-1 text-sm text-ink-soft">
            Kalau dikosongkan, tombol Saluran WhatsApp tidak ditampilkan di halaman mana pun.
          </p>
        </div>

        <div>
          <label className="label-isian" htmlFor="instagram_url">
            Instagram
          </label>
          <input
            id="instagram_url"
            name="instagram_url"
            defaultValue={pengaturan.instagram_url ?? ""}
            className="isian"
          />
        </div>

        <div>
          <label className="label-isian" htmlFor="tiktok_url">
            TikTok
          </label>
          <input id="tiktok_url" name="tiktok_url" defaultValue={pengaturan.tiktok_url ?? ""} className="isian" />
        </div>

        <div>
          <label className="label-isian" htmlFor="youtube_url">
            YouTube
          </label>
          <input id="youtube_url" name="youtube_url" defaultValue={pengaturan.youtube_url ?? ""} className="isian" />
        </div>

        <div>
          <label className="label-isian" htmlFor="about_markdown">
            Teks tentang kami
          </label>
          <textarea
            id="about_markdown"
            name="about_markdown"
            rows={8}
            defaultValue={pengaturan.about_markdown}
            className="isian"
          />
          <p className="mt-1 text-sm text-ink-soft">
            Boleh memakai markdown sederhana: ## untuk judul, ** untuk tebal, dan tanda hubung untuk daftar.
          </p>
        </div>
      </FormAksi>
    </div>
  );
}
