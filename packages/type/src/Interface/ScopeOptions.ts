import {Schema} from "../Schema";
import {Container, Context} from "../Scope";
import {ContainerCtor} from "./ContainerCtor";
import {ContextCtor} from "./ContextCtor";

export type ScopeOptions<X extends Context<C> = never, C extends Container = never> = {
    schema: Schema;
    context?: ContextCtor<X, C>;
    container?: ContainerCtor<C>;
};
