type Props = { className?: string };

/**
 * Ikon digambar sendiri dan hanya ada untuk hal yang butuh penanda cepat di
 * layar kecil. Tidak memakai satu set ikon garis tipis seragam.
 */

export function IkonWhatsApp({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.3A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.1 14.9l-.4-.2-2.6.6.7-2.5-.2-.4A8 8 0 0 1 12 4Zm-3 4c-.3 0-.7.1-1 .5-.4.4-.9 1-.9 2s.9 2.1 1 2.3c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.6.7 3 .6.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4l-.7-.4-1.6-.7c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.1-.2 0-.4.1-.5l.5-.6c.1-.2.2-.3.3-.5v-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4H9Z" />
    </svg>
  );
}

export function IkonUnduh({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4" />
      <path d="M4 19h16" />
    </svg>
  );
}

export function IkonSalin({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 5H6a2 2 0 0 0-2 2v9" />
    </svg>
  );
}

export function IkonCentang({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}

export function IkonKalender({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function IkonLokasi({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
