/**
 * Renderer markdown kecil untuk isi yang ditulis pengurus lewat panel admin.
 * Sengaja tidak memakai library: kebutuhannya hanya paragraf, judul, daftar,
 * tebal, miring, dan tautan. Semua HTML mentah di-escape lebih dulu, dan
 * tautan dibatasi ke http, https, dan mailto.
 */

function escapeHtml(teks: string): string {
  return teks
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tautanAman(url: string): string | null {
  const bersih = url.trim();
  if (/^(https?:|mailto:|\/)/i.test(bersih)) return bersih;
  return null;
}

function inline(teks: string): string {
  let hasil = escapeHtml(teks);
  hasil = hasil.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (cocok, label: string, url: string) => {
    const aman = tautanAman(url);
    if (!aman) return label;
    const luar = /^https?:/i.test(aman);
    return `<a href="${aman}"${luar ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
  });
  hasil = hasil.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  hasil = hasil.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  return hasil;
}

export function renderMarkdown(sumber: string): string {
  const baris = sumber.replace(/\r\n/g, "\n").split("\n");
  const keluar: string[] = [];
  let daftar: "ul" | "ol" | null = null;
  let paragraf: string[] = [];

  const tutupParagraf = () => {
    if (paragraf.length) {
      keluar.push(`<p>${paragraf.map(inline).join("<br />")}</p>`);
      paragraf = [];
    }
  };
  const tutupDaftar = () => {
    if (daftar) {
      keluar.push(`</${daftar}>`);
      daftar = null;
    }
  };

  for (const isi of baris) {
    const teks = isi.trimEnd();
    if (!teks.trim()) {
      tutupParagraf();
      tutupDaftar();
      continue;
    }
    const judul = /^(#{1,4})\s+(.*)$/.exec(teks);
    if (judul) {
      tutupParagraf();
      tutupDaftar();
      const level = Math.min(4, judul[1].length + 1);
      keluar.push(`<h${level}>${inline(judul[2])}</h${level}>`);
      continue;
    }
    const butir = /^[-*]\s+(.*)$/.exec(teks);
    if (butir) {
      tutupParagraf();
      if (daftar !== "ul") {
        tutupDaftar();
        keluar.push("<ul>");
        daftar = "ul";
      }
      keluar.push(`<li>${inline(butir[1])}</li>`);
      continue;
    }
    const nomor = /^\d+[.)]\s+(.*)$/.exec(teks);
    if (nomor) {
      tutupParagraf();
      if (daftar !== "ol") {
        tutupDaftar();
        keluar.push("<ol>");
        daftar = "ol";
      }
      keluar.push(`<li>${inline(nomor[1])}</li>`);
      continue;
    }
    tutupDaftar();
    paragraf.push(teks.trim());
  }
  tutupParagraf();
  tutupDaftar();
  return keluar.join("\n");
}

/** Ringkasan polos untuk deskripsi meta dan kartu, tanpa tanda markdown. */
export function ringkas(sumber: string, panjang = 155): string {
  const polos = sumber
    .replace(/[#*_>`]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (polos.length <= panjang) return polos;
  return `${polos.slice(0, panjang - 1).trimEnd()}...`;
}
