import {Container, Context} from "../Scope";
import {InputObjectType} from "../Type";
import {Promisable} from "./index";
import {Lookup} from "./Lookup";
import {OutputType} from "./Schema";

export type ResolverArgs<T extends (OutputType
    | InputObjectType
    | Lookup<Container>
    | Lookup<Context<any>>
    | Container
    | Context<any>) = any> = T;

export type ResolverFunction<T> = (...args: ResolverArgs[]) => Promisable<T>;
