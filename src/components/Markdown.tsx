import { renderMarkdown } from "@/lib/markdown";

export default function Markdown({ sumber, className }: { sumber: string; className?: string }) {
  return (
    <div
      className={`isi-tulisan ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(sumber) }}
    />
  );
}
