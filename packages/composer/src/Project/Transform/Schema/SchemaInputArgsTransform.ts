import {GraphQLFieldConfigArgumentMap, GraphQLNonNull} from "graphql";
import * as vm from "vm";
import {IPropertyFunction, PropertyType} from "../../../Type";
import {TraceEvent} from "../../../util/TraceEvent";
import {TransformAbstract} from "../TransformAbstract";
import {SchemaObjectFieldTransform} from "./SchemaObjectFieldTransform";
import {SchemaTransform} from "./SchemaTransform";

type Args = [SchemaTransform, SchemaObjectFieldTransform, IPropertyFunction];
type Returns = GraphQLFieldConfigArgumentMap | undefined;

export class SchemaInputArgsTransform extends TransformAbstract<Args, Returns> {
    protected traceEvent = TraceEvent.create(this);

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

    public transform(): Returns {
        const args: GraphQLFieldConfigArgumentMap = {};
        for (const arg of this.property.args) {
            const type = this.schema.input.resolve(this.type, arg);
            if (type) {
                args[arg.name] = {
                    defaultValue: this.getDefaultValue(arg),
                    type: !arg.nullable
                        ? new GraphQLNonNull(type)
                        : type,
                };
            }
        }

        return args;
    }

    protected getDefaultValue(property: PropertyType) {
        if (property.defaultValue) {
            return vm.runInContext(property.defaultValue, vm.createContext({}));
        }

        return undefined;
    }
}
