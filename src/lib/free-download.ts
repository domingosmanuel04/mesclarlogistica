/** Shared free eBook download via API token */
export async function downloadFreeEbookById(bookId: string, slug: string) {
  const res = await fetch("/api/books/free-download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookId }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || "Download indisponível.");
  }
  const url = (json.url as string) || `/api/download/${json.downloadToken}`;
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slug}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
