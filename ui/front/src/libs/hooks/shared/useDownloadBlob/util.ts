export function forceDownload(filePath:string, filename: string) {
  const a = document.createElement('A') as HTMLAnchorElement;
  a.href = filePath;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return false;
}
