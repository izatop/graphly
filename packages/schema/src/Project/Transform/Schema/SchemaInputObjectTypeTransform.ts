import {ok} from "assert";
import {GraphQLInputFieldConfigMap, GraphQLInputObjectType, GraphQLNonNull, Thunk} from "graphql";
import * as vm from "vm";
import {InputType, ITypeObject, PropertyKind, PropertyType, ScalarType} from "../../../Type";
import {TransformAbstract} from "../TransformAbstract";
import {tryToGetEnumDefaultValue} from "./enum";
import {SchemaTransform} from "./SchemaTransform";

type Args = [SchemaTransform, ITypeObject];

export class SchemaInputObjectTypeTransform extends TransformAbstract<Args, GraphQLInputObjectType> {
    public get schema() {
        return this.args[0];
    }

    public get type() {
        return this.args[1];
    }

    public get project() {
        return this.schema.project;
    }

    public transform() {
        ok(
            InputType.has(this.type.base),
            `Wrong input object base type ${this.type.base} of ${this.type.name}`,
        );

        return new GraphQLInputObjectType({
            name: this.type.name,
            // @todo Pick a description from comments
            description: `Description of ${this.type.name}`,
            fields: () => this.fields(),
        });
    }

    protected fields(): GraphQLInputFieldConfigMap {
        const fields: Thunk<GraphQLInputFieldConfigMap> = {};
        for (const property of this.type.property) {
            const type = this.schema.input.resolve(this.type, property);
            if (type) {
                fields[property.name] = {
                    type: !property.nullable
                        ? new GraphQLNonNull(type)
                        : type,
                    defaultValue: this.getDefaultValue(property),
                };
            }
        }

        return fields;
    }

    protected getDefaultValue(property: PropertyType) {
        if (property.defaultValue) {
            switch (property.kind) {
                case PropertyKind.REFERENCE:
                    if (ScalarType.has(property.reference) || property.reference === "Array") {
                        return vm.runInContext(property.defaultValue, vm.createContext({}));
                    }

                    return tryToGetEnumDefaultValue(
                        property.defaultValue,
                        this.project.types.get(property.reference),
                    );
                case PropertyKind.SCALAR:
                    return vm.runInContext(property.defaultValue, vm.createContext({}));
                default:
                    throw Error("Default value should be a scalar or enum");
            }
        }

        return undefined;
    }
}
