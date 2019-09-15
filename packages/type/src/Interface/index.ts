import {ResolverFunction} from "./Resolver";

export * from "./Lookup";
export * from "./Request";
export * from "./Resolver";
export * from "./Schema";
export * from "./IObject";

export type KeyValue<V = any> = { [key: string]: V };
export type Arrayable<T> = T | T[];
export type Resolvable<T> = T | ResolverFunction<T>;
export type Promisable<T> = T | Promise<T>;
