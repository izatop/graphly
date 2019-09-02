import {GraphQLFieldConfig, GraphQLFieldResolver, GraphQLList, GraphQLNonNull, GraphQLOutputType} from "graphql";
import * as vm from "vm";
import {IProperty, IPropertyResolver, IType, PropertyBox} from "../../../Serialization/interfaces";
import {TraceEvent} from "../../../util/TraceEvent";
import {Boxes} from "../interfaces";
import {TransformAbstract} from "../TransformAbstract";
import {SchemaObjectTypeTransform} from "./SchemaObjectTypeTransform";
import {SchemaResolveTransform} from "./SchemaResolveTransform";
import {SchemaTransform} from "./SchemaTransform";

type Args = [SchemaTransform, IType, IProperty | IPropertyResolver];
type Returns = GraphQLFieldConfig<any, any, any>;

export class SchemaFieldTransform extends TransformAbstract<Args, Returns> {
    protected traceEvent = TraceEvent.create(this);

    public get context() {
        return this.args[0];
    }

    public get type() {
        return this.args[1];
    }

    public get property() {
        return this.args[2];
    }

    public get types() {
        return this.context.types;
    }

    public get project() {
        return this.context.project;
    }

    public transform(): Returns {
        this.traceEvent.emit("transform", this.property);
        if (typeof this.property.type === "string") {
            return this.transformStringType();
        }

        if (this.property.type instanceof PropertyBox) {
            const type = this.transformBoxType(this.property.type);
            return {
                resolve: this.createResolver(),
                type: !this.property.nullable
                    ? new GraphQLNonNull(type)
                    : type,
            };
        }

        throw new Error(`Cannot resolve type of ${this.property.name}`);
    }

    protected transformBoxType(property: PropertyBox): GraphQLOutputType {
        const {type, args} = property;
        const [parameter, ...parameters] = args;

        if (parameter instanceof PropertyBox) {
            return this.transformBoxType(parameter);
        }

        if (type === Boxes.Array) {
            return new GraphQLList(this.resolveType(parameter as string));
        }

        return this.resolveType(parameter as string);
    }

    protected transformStringType(): Returns {
        const type = this.resolveType(this.property.type as string);

        return {
            resolve: this.createResolver(),
            type: !this.property.nullable
                ? new GraphQLNonNull(type)
                : type,
        };
    }

    protected resolveType(type: string) {
        this.traceEvent.emit("resolve", {
            name: this.type.name,
            scalar: this.context.typeTransform.has(type),
            objectType: this.context.types.has(type),
        });

        if (this.context.typeTransform.has(type)) {
            return this.context.typeTransform.transform(type);
        }

        if (this.context.types.has(type)) {
            return new SchemaObjectTypeTransform(this.context, this.context.types.get(type)!)
                .transform();
        }

        throw new Error(`Cannot resolve type of ${this.property.name}`);
    }

    protected createResolver(): GraphQLFieldResolver<any, any, any> | undefined {
        const hasResolver = "resolver" in this.property;
        const {defaultValue} = this.property;

        // A little hack to get a default value for a property which wasn't defined at start.
        // For example we have been added NewProp to a schema but can't update it on database
        // and want to sure it be an array whatever:
        // class Foo { public readonly myNewProp: NewPropType[] = [] }
        if (!hasResolver && defaultValue) {
            const propertyKey = this.property.name;
            const resolverFunction = function resolver(this: object) {
                return vm.runInContext(defaultValue, vm.createContext(this));
            };

            return (parent?: {[key: string]: any}) => {
                if (!parent || typeof parent[propertyKey] === "undefined") {
                    return resolverFunction.call(parent || {});
                }

                return parent[propertyKey];
            };
        }

        if (!hasResolver) {
            return;
        }

        return new SchemaResolveTransform(this.context, this.type, this.property).transform();
    }
}
