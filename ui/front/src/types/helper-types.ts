export type ErrorHandler = (err: Error) => void;

export type PromiseArg<T> = (reason?: T) => void;
