import {XMap} from "@sirian/common";
import {ok} from "assert";
import {GraphQLObjectType} from "graphql";
import {IPropertyReference, ITypeObject, PropertyKind, PropertyType, TYPE, TypeKind} from "../../../Type";
import {ucfirst} from "../../../util/ucfirst";
import {InterfaceType} from "../InterfaceType";
import {TransformAbstract} from "../TransformAbstract";
import {SchemaObjectTypeTransform} from "./SchemaObjectTypeTransform";
import {SchemaTransform} from "./SchemaTransform";

type Args = [SchemaTransform, string, IPropertyReference, ITypeObject];

export class SchemaInterfaceTypeTransform extends TransformAbstract<Args, GraphQLObjectType> {

    public static getInterfaceName(of: ITypeObject, property: IPropertyReference, interfaceType: ITypeObject) {
        const nameChain = [];
        const interfaceReferences = property.parameters
            .filter((p) => p.kind === PropertyKind.REFERENCE) as IPropertyReference[];
        if (interfaceReferences.length === 0) {
            nameChain.push(of.name, property.name);
        }

        if (interfaceReferences.length > 0) {
            nameChain.push(
                interfaceType.name,
                ...interfaceReferences.map((p) => p.reference),
            );
        }

        return nameChain.map(ucfirst).join("");
    }
    public get context() {
        return this.args[0];
    }

    public get name() {
        return this.args[1];
    }

    public get property() {
        return this.args[2];
    }

    public get interfaceType() {
        return this.args[3];
    }

    public get project() {
        return this.context.project;
    }

    public transform() {
        ok(
            this.interfaceType.base === TYPE.OBJECT_INTERFACE,
            `Wrong interface base type ${this.interfaceType.base} of ${this.interfaceType.name}`,
        );

        const map = new XMap<string, PropertyType>();
        if (this.interfaceType.parameter) {
            for (const [index, parameter] of this.interfaceType.parameter.entries()) {
                map.set(parameter, this.property.parameters[index]);
            }
        }

        const nextProperty: PropertyType[] = [];
        for (const p of this.interfaceType.property) {
            nextProperty.push(InterfaceType.replaceTypeParameter(map, p));
        }

        const nextType: ITypeObject = {
            name: this.name,
            kind: TypeKind.CLASS,
            file: this.interfaceType.file,
            base: this.interfaceType.base,
            reference: this.interfaceType.base,
            property: nextProperty,
            parameter: this.interfaceType.parameter,
        };

        return new SchemaObjectTypeTransform(this.context, nextType)
            .transform();
    }
}
