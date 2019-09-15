import {Composer, IComposerOptions} from "@graphly/composer";
import {Var} from "@sirian/common";
import {IncomingMessage} from "http";
import * as path from "path";
import {RequestContext, resolve} from "../helpers";
import {KeyValue, RequestLifecycleHooks} from "../Interface";
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

    public async createConfig(state: TState) {
        const schema = this.createSchema();
        const container = await this.createContainer();
        const contextCtor = this.options.context;

        return {
            schema,
            context: new contextCtor(container, state),
            rootValue: {},
        };
    }

    public async createServerConfig(hooks: RequestLifecycleHooks<TState, TContainer>) {
        const schema = this.createSchema();
        const container = await this.createContainer();
        const createContextState = RequestContext.createContextState(hooks, container);
        const contextCtor = this.options.context;
        const context = async (request: IncomingMessage) => {
            const state = await createContextState(request);
            return new contextCtor(container, state);
        };

        return {
            schema,
            context,
            rootValue: {},
        };
    }

    protected getComposerConfiguration(): IComposerOptions {
        const {schema} = this.options;
        const location = schema.getSchemaLocation();
        const filename = Var.isObject(location)
            ? location.filename
            : location;

        return {
            basePath: path.dirname(filename),
            schemaPath: filename,
            name: schema.name,
        };
    }

    protected createContainer() {
        return resolve(new this.options.container(this.options.config));
    }

    protected createSchema() {
        const options = this.getComposerConfiguration();
        return new Composer(options)
            .compose()
            .toSchema();
    }
}
