import {ok} from "assert";
import {GraphQLFieldResolver} from "graphql";
import {resolve} from "path";
import * as vm from "vm";
import {IProperty, IPropertyResolver, IType} from "../../../Serialization/interfaces";
import {TraceEvent} from "../../../util/TraceEvent";
import {TransformAbstract} from "../TransformAbstract";
import {SchemaTransform} from "./SchemaTransform";

type Args = [SchemaTransform, IType, IProperty | IPropertyResolver];
type Returns = GraphQLFieldResolver<any, any, any> | undefined;

export class SchemaResolveTransform extends TransformAbstract<Args, Returns> {
    protected traceEvent = TraceEvent.create(this);

    public get types() {
        return this.context.types;
    }

    public get context() {
        return this.args[0];
    }

    public get type() {
        return this.args[1];
    }

    public get property() {
        return this.args[2];
    }

    public transform(): Returns {
        const file = resolve(this.context.project.root, this.type.file);
        this.traceEvent.emit("require", {file, type: this.type.name, resolver: this.property.name});

        const module = require(file);
        ok(this.type.name in module, `Cannot find module ${this.type.name} at ${file}`);

        const owner: ObjectConstructor = Reflect.get(module, this.type.name);
        ok(
            this.property.name in owner.prototype,
            `Cannot find resolver ${this.type.name}.${this.property.name} at ${file}`,
        );

        const descriptor = Reflect.getOwnPropertyDescriptor(owner.prototype, this.property.name)!;
        const resolver = this.create(descriptor);

        this.traceEvent.emit("resolver", resolver);
        return (parent: object, args: object, context: object) => {
            return resolver.call(parent);
        };
    }

    protected create(descriptor: PropertyDescriptor) {
        ok(
            descriptor && descriptor.value || descriptor.get,
            `Wrong resolver function ${this.type.name}.${this.property.name}`,
        );

        return descriptor.value || descriptor.get;
    }
}
