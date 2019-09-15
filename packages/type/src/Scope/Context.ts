import {KeyValue, Lookup} from "../Interface";
import {Container} from "./Container";

export type ContextCtor<TContext extends Context<TContainer, TConfig, TState>,
    TContainer extends Container<TConfig>,
    TConfig extends KeyValue = {},
    TState extends KeyValue = {}> = new (container: Lookup<TContainer>, state: TState) => TContext;

export class Context<TContainer extends Container<TConfig>,
    TConfig extends KeyValue = {},
    TState extends KeyValue = {}> {

    public readonly state: TState;

    public readonly container: Lookup<TContainer>;

    constructor(container: Lookup<TContainer>, state: TState) {
        this.state = state;
        this.container = container;
    }

    protected get config() {
        return this.container.config;
    }
}
