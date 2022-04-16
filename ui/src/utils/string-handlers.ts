export function limitStr(str: string, n: number, symb = '...') {
  const condition = str.length < n || (!n && !symb);
  if (condition) return str;
  return str.substring(0, n - symb.length) + symb;
}
