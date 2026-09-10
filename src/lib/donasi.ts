/**
 * Batas jumlah paket dalam satu kiriman donasi.
 *
 * Ditaruh di modul biasa, bukan di `donasi/actions.ts`, karena modul
 * `"use server"` hanya boleh mengekspor fungsi async. Formulir dan aksi server
 * mengimpor angka yang sama, jadi batas yang ditulis di layar tidak pernah
 * berbeda dengan batas yang benar-benar ditegakkan.
 */
export const BATAS_PAKET = 2000;
