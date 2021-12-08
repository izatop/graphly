import {KeyValue, Lookup} from "../Interface";
import {Container} from "./Container";

export type ContextCtor<TContext extends Context<TContainer, TConfig, TState>,
    TContainer extends Container<TConfig>,
    TConfig extends KeyValue = KeyValue,
    TState extends KeyValue = KeyValue> = new (container: Lookup<TContainer>, state: TState) => TContext;

export class Context<TContainer extends Container<TConfig>,
    TConfig extends KeyValue = KeyValue,
    TState extends KeyValue = KeyValue> {

    public readonly state: TState;

    public readonly container: Lookup<TContainer>;

    constructor(container: Lookup<TContainer>, state: TState) {
        this.state = state;
        this.container = container;
    }

    protected get config(): TConfig {
        return this.container.config as TConfig;
    }
}
