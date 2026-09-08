"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { SocialPost } from "@/lib/data/types";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

/**
 * Sorotan post Instagram dan TikTok.
 *
 * Skrip embed kedua platform berat dan melacak pengunjung, jadi tidak dimuat
 * saat beranda dibuka. Wadahnya dirender dengan tinggi pasti lebih dulu, dan
 * skripnya baru diminta saat bagian ini benar-benar mendekati layar. Tanpa itu,
 * nilai performa beranda jatuh dan LCP foto hero ikut mundur.
 *
 * Rasio wadahnya dipatok supaya iframe yang tingginya baru diketahui belakangan
 * tidak menggeser isi di bawahnya.
 */
export default function SorotanSosmed({ daftar }: { daftar: SocialPost[] }) {
  const wadah = useRef<HTMLDivElement>(null);
  const [dekat, setDekat] = useState(false);

  useEffect(() => {
    const elemen = wadah.current;
    if (!elemen || dekat) return;

    // Peramban lama tanpa IntersectionObserver tetap kebagian: embed-nya
    // langsung dimuat, bukan tidak pernah muncul.
    if (typeof IntersectionObserver === "undefined") {
      setDekat(true);
      return;
    }

    const pengamat = new IntersectionObserver(
      (masukan) => {
        if (masukan.some((satu) => satu.isIntersecting)) {
          setDekat(true);
          pengamat.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    pengamat.observe(elemen);
    return () => pengamat.disconnect();
  }, [dekat]);

  const adaInstagram = daftar.some((satu) => satu.platform === "instagram");
  const adaTiktok = daftar.some((satu) => satu.platform === "tiktok");

  if (daftar.length === 0) return null;

  return (
    <div ref={wadah}>
      <ul className="grid gap-4 sm:grid-cols-2">
        {daftar.map((satu) => (
          <li key={satu.id} className="kartu overflow-hidden p-0">
            <div
              className={`relative w-full overflow-hidden ${
                satu.platform === "instagram" ? "aspect-[4/5]" : "aspect-[9/16]"
              }`}
            >
              {dekat ? (
                satu.platform === "instagram" ? (
                  <blockquote
                    className="instagram-media absolute inset-0 h-full w-full"
                    data-instgrm-permalink={satu.post_url}
                    data-instgrm-version="14"
                  >
                    <a href={satu.post_url} target="_blank" rel="noopener noreferrer">
                      Buka post ini di Instagram
                    </a>
                  </blockquote>
                ) : (
                  <blockquote
                    className="tiktok-embed absolute inset-0 h-full w-full"
                    cite={satu.post_url}
                    data-video-id=""
                  >
                    <section>
                      <a href={satu.post_url} target="_blank" rel="noopener noreferrer">
                        Buka post ini di TikTok
                      </a>
                    </section>
                  </blockquote>
                )
              ) : (
                // Sebelum skripnya dimuat, wadahnya tetap berupa tautan yang
                // bisa dibuka. Kalau embed-nya gagal, ini yang tersisa.
                <a
                  href={satu.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-cream text-sm font-semibold text-teal-ink"
                >
                  Buka di {satu.platform === "instagram" ? "Instagram" : "TikTok"}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      {dekat && adaInstagram ? (
        <Script
          src="https://www.instagram.com/embed.js"
          strategy="lazyOnload"
          // Skrip Instagram hanya memindai DOM sekali saat dimuat. Setelah
          // pindah halaman lewat router, pemindaian itu perlu diminta ulang.
          onReady={() => window.instgrm?.Embeds.process()}
        />
      ) : null}
      {dekat && adaTiktok ? <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" /> : null}
    </div>
  );
}
