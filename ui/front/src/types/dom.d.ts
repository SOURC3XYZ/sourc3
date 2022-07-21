interface CustomEventMap {
  'customnumberevent': CustomEvent<number>;
  'anothercustomevent': CustomEvent<CustomParams>;
}
declare global {
  interface Document { // adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends keyof CustomEventMap>(type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void): void;
  }
}
export { }; // keep that to TS compliler.
