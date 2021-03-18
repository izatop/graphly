import {Project} from "@graphly/schema";
import {isObject} from "@sirian/common";
import {memoize} from "@sirian/decorators";
import {resolve} from "../helpers";
import {KeyValue, RequestHooks} from "../Interface";
import {Schema, SchemaCtor} from "../Schema";
import {Container, ContainerCtor} from "./Container";
import {Context, ContextCtor} from "./Context";

export type ScopeOptions<TContext extends Context<TContainer, TConfig, TState>,
    TContainer extends Container<TConfig>,
    TConfig extends KeyValue = {},
    TState extends KeyValue = {}> = {
    schema: SchemaCtor<Schema>;
    context: ContextCtor<TContext, TContainer, TConfig, TState>;
    container: ContainerCtor<TContainer, TConfig>;
    config: TConfig;
};

export class Scope<TContext extends Context<TContainer, TConfig, TState>,
    TContainer extends Container<TConfig>,
    TConfig extends KeyValue = {},
    TState extends KeyValue = {}> {
    protected options: ScopeOptions<TContext, TContainer, TConfig, TState>;

    constructor(options: ScopeOptions<TContext, TContainer, TConfig, TState>) {
        this.options = options;
    }

    /**
     * @deprecated
     * @param hook
     */
    public async createFactory<T = undefined>(hook: RequestHooks<TState, TContainer, T>) {
        return this.create(hook);
    }

    public async create<T = undefined>(hook: RequestHooks<TState, TContainer, T>) {
        const schema = await this.createSchema();
        const container = await this.createContainer();
        return async <R>(payload: T, rootValue: any = {}) => {
            const state = await hook(payload, container);
            const contextValue = new this.options.context(container, state);

            return {
                schema,
                rootValue,
                contextValue,

                // @deprecated
                context: contextValue,
            };
        };
    }

    public async createConfig(state: TState, rootValue: any = {}) {
        const schema = await this.createSchema();
        const container = await this.createContainer();
        const contextValue = new this.options.context(container, state);

        return {
            schema,
            rootValue,
            contextValue,

            // @deprecated
            context: contextValue,
        };
    }

    @memoize()
    public createContainer() {
        return resolve(new this.options.container(this.options.config));
    }

    @memoize()
    protected async createSchema() {
        const {schema} = this.options;
        const location = schema.getSchemaLocation();
        const filename = isObject(location)
            ? location.filename
            : location;

        const project = await Project.from(filename);
        return project.toSchema();
    }
}
