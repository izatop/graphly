import {Project} from "@graphly/schema";
import {isObject} from "@sirian/common";
import {memoize} from "@sirian/decorators";
import {GraphQLSchema} from "graphql";
import {resolve} from "../helpers";
import {KeyValue, RequestHooks, ScopeFactoryReturnType, ScopeFactoryType, Lookup} from "../Interface";
import {Schema, SchemaCtor} from "../Schema";
import {Container, ContainerCtor} from "./Container";
import {Context, ContextCtor} from "./Context";

export type ScopeOptions<TContext extends Context<TContainer, TConfig, TState>,
    TContainer extends Container<TConfig>,
    TConfig extends KeyValue = KeyValue,
    TState extends KeyValue = KeyValue> = {
        schema: SchemaCtor<Schema>;
        context: ContextCtor<TContext, TContainer, TConfig, TState>;
        container: ContainerCtor<TContainer, TConfig>;
        config: TConfig;
    };

export class Scope<TContext extends Context<TContainer, TConfig, TState>,
    TContainer extends Container<TConfig>,
    TConfig extends KeyValue = KeyValue,
    TState extends KeyValue = KeyValue> {
    protected options: ScopeOptions<TContext, TContainer, TConfig, TState>;

    constructor(options: ScopeOptions<TContext, TContainer, TConfig, TState>) {
        this.options = options;
    }

    public async create<T = undefined>(hook: RequestHooks<TState, TContainer, T>): Promise<ScopeFactoryType<T>> {
        const schema = await this.createSchema();
        const container = await this.createContainer();
        return async (payload: T, rootValue: any = {}): Promise<ScopeFactoryReturnType> => {
            const state = await hook(payload, container);
            const contextValue = new this.options.context(container, state);

            return {
                schema,
                rootValue,
                contextValue,
            };
        };
    }

    public async createConfig(state: TState, rootValue: any = {}): Promise<ScopeFactoryReturnType> {
        const schema = await this.createSchema();
        const container = await this.createContainer();
        const contextValue = new this.options.context(container, state);

        return {
            schema,
            rootValue,
            contextValue,
        };
    }

    @memoize()
    public createContainer(): Promise<Lookup<TContainer>> {
        return resolve(new this.options.container(this.options.config));
    }

    @memoize()
    protected async createSchema(): Promise<GraphQLSchema> {
        const {schema} = this.options;
        const location = schema.getSchemaLocation();
        const filename = isObject(location)
            ? location.filename
            : location;

        return Project
            .from(filename)
            .toSchema();
    }
}
