import {Container, Context} from "../Scope";
import {ContextPayload} from "./ContextPayload";

export type ContextCtor<
    T extends Context<C>,
    C extends Container = never> = new (payload: ContextPayload, container: C) => T;
