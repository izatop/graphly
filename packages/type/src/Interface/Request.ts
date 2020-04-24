import {Container} from "../Scope";
import {KeyValue, Lookup} from "./index";

export type RequestHooks<TState extends KeyValue,
    C extends Container,
    TPayload = undefined> = (payload: TPayload, container: Lookup<C>) => TState | Promise<TState>;
