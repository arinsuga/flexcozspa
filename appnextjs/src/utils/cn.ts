type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[];

export function cn(...classes: ClassValue[]) {
  return classes
    .flatMap((c): string[] => {
      if (typeof c === 'string') return c.split(' ');
      if (typeof c === 'number') return [c.toString()];
      if (Array.isArray(c)) return cn(...c).split(' ');
      if (typeof c === 'object' && c !== null) {
        return Object.entries(c)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return [];
    })
    .filter(Boolean)
    .join(' ');
}
