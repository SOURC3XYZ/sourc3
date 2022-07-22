export function forceDownload(blob:string, filename: string) {
  const a = document.createElement('a');
  a.download = filename;
  a.href = blob;
  a.title = 'Download File';
  // For Firefox https://stackoverflow.com/a/32226068
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 7000);
}
