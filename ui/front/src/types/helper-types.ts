export type ErrorHandler = (err: Error) => void;

export type PromiseArg<T> = (reason?: T) => void;

export type OwnerListType = 'all' | 'my';

export type Entries<T> = { [K in keyof T]: [K, T[K]]; }[keyof T][];
