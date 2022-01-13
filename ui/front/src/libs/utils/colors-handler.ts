export function colorizer<T>(index: number, colors: T[]): T {
  return colors[
    index - (Math.floor(index / colors.length) * colors.length)];
}

export const setGradient = (color: string, constColor: string): string => `
linear-gradient(93deg, ${color} 2%, ${constColor} 99%)`;
