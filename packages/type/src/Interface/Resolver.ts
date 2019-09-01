import {ResolverArgs} from "./ResolverArgs";

export type Resolver<T> = (...args: ResolverArgs[]) => T | Promise<T>;
