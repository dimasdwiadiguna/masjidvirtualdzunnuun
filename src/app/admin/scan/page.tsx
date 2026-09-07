import type { Metadata } from "next";
import PapanCheckIn from "@/components/admin/PapanCheckIn";

export const metadata: Metadata = { title: "Check-in", robots: { index: false } };

export default function AdminScan() {
  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6">
      <h1>Check-in</h1>
      <p className="mt-1 text-ink-soft">
        Dua cara yang setara: ketik kodenya, atau pindai QR di tiket. Hasilnya muncul besar supaya terbaca sambil
        berdiri di pintu.
      </p>
      <PapanCheckIn />
    </div>
  );
}
