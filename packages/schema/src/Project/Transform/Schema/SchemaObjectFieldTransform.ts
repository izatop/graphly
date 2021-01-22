import {isUndefined} from "@sirian/common";
import {ok} from "assert";
import {GraphQLFieldConfig, GraphQLFieldResolver, GraphQLNonNull} from "graphql";
import * as vm from "vm";
import {PropertyKind, PropertyType, TYPE} from "../../../Type";
import {TransformAbstract} from "../TransformAbstract";
import {SchemaInputArgsTransform} from "./SchemaInputArgsTransform";
import {SchemaObjectTypeTransform} from "./SchemaObjectTypeTransform";
import {SchemaResolveTransform} from "./SchemaResolveTransform";
import {SchemaTransform} from "./SchemaTransform";

type Args = [SchemaTransform, SchemaObjectTypeTransform, PropertyType];
type Returns = GraphQLFieldConfig<any, any, any>;

export class SchemaObjectFieldTransform extends TransformAbstract<Args, Returns> {
    public get schema() {
        return this.args[0];
    }

    public get context() {
        return this.args[1];
    }

    public get type() {
        return this.context.type;
    }

    public get property() {
        return this.args[2];
    }

    public get project() {
        return this.context.project;
    }

    public transform(): Returns {
        const type = this.schema.output.resolve(this.type, this.property)!;
        this.assert(
            type,
            `Cannot resolve field type of ${this.type.name}.${this.property.name}`,
            () => this.property,
        );

        return {
            args: this.createResolveFunctionArgs(),
            resolve: this.createObjectResolveFunction(),
            subscribe: this.createSubscriptionResolveFunction(),
            type: !this.property.nullable
                ? new GraphQLNonNull(type)
                : type,
        };
    }

    protected createResolveFunctionArgs() {
        if (this.property.kind === PropertyKind.FUNCTION) {
            return new SchemaInputArgsTransform(this.schema, this, this.property)
                .transform();
        }

        return;
    }

    protected createObjectResolveFunction(): GraphQLFieldResolver<any, any, any> | undefined {
        if (this.type.base === TYPE.SUBSCRIPTION) {
            const key = this.property.name;
            // Mutate the subscription source by the GraphQLResolveInfo object
            return (source: unknown, args, context, info) => {
                const rootValue = {[key]: source};
                Object.assign(info, {rootValue});
                return source;
            };
        }

        if (this.type.base !== TYPE.OBJECT) {
            return undefined;
        }

        const hasResolver = this.property.kind === PropertyKind.FUNCTION;
        const {defaultValue} = this.property;

        // A little hack to get a default value for a property which wasn't defined at start.
        // For example we have been added NewProp to a schema but can't update it on database
        // and want to sure it be an array whatever:
        // class Foo { public readonly myNewProp: NewPropType[] = [] }
        if (!hasResolver && defaultValue) {
            const propertyKey = this.property.name;
            const resolverFunction = function resolver(this: object) {
                return vm.runInContext(`(${defaultValue})`, vm.createContext(this));
            };

            return (parent?: { [key: string]: any }) => {
                if (!parent || isUndefined(parent[propertyKey])) {
                    return resolverFunction.call(parent || {});
                }

                return parent[propertyKey];
            };
        }

        if (this.property.kind === PropertyKind.FUNCTION) {
            return new SchemaResolveTransform(this.schema, this, this.property)
                .transform();
        }

        return this.createObjectPropertyResolveFunction(this.property);
    }

    /**
     * Resolve empty object for stub properties like RootQuery.todo.search where
     * Foo.todo is a property of a sub type TodoQuery { search(), ... }
     *
     * @param property
     */
    protected createObjectPropertyResolveFunction(property: PropertyType): any {
        if (property.kind === PropertyKind.REFERENCE && this.schema.types.has(property.reference)) {
            const propertyKey = this.property.name;
            return (parent: { [key: string]: any }) => {
                if (!isUndefined(parent[propertyKey])) {
                    return parent[propertyKey];
                }

                return {};
            };
        }

        return;
    }

    protected createSubscriptionResolveFunction(): GraphQLFieldResolver<any, any, any> | undefined {
        if (this.type.base !== TYPE.SUBSCRIPTION) {
            return undefined;
        }

        ok(
            this.property.kind === PropertyKind.FUNCTION,
            `${this.type.name}.${this.property.name} should provide a subscribe function`,
        );

        if (this.property.kind === PropertyKind.FUNCTION) {
            return new SchemaResolveTransform(this.schema, this, this.property)
                .transform();
        }
    }
}
