export const argsStringify = (
  args: { [key: string]: string }
): string => Object.entries(args)
  .filter((arg) => arg[1].length)
  .map((arg) => arg.join('='))
  .join(',');
