export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends Object ? DeepReadonly<T[K]> : T[K]
}
