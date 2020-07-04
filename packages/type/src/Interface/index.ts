import {ResolverFunction} from "./Resolver";

export * from "./Lookup";
export * from "./Request";
export * from "./Resolver";
export * from "./Schema";
export * from "./IObject";

export type $Nullable = undefined | null;

export type KeyValue<V = any> = { [key: string]: V };
export type Arrayable<T> = T | T[];
export type Resolvable<T> = T | ResolverFunction<T>;
export type Promisable<T> = T | Promise<T>;
export type Returns<T> = Promise<T>;
export type ReturnsNullable<T> = Promise<T | $Nullable>;

export type $Pick<T, D> = { [K in keyof T]: K extends keyof D ? T[K] extends D[K] ? T[K] : never : T[K] };
export type $InType<T, D> = T extends PromiseLike<any> ? never : $Pick<T, D>;
export type $Implement<T, TProtected extends keyof T = never> = |
    Partial<TProtected extends never ? T : Omit<T, TProtected>>;
