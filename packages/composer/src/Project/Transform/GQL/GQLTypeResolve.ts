import {XMap} from "@sirian/common";
import {ok} from "assert";
import {
    IPropertyFunction,
    IPropertyReference,
    ITypeObject,
    PropertyKind,
    PropertyType,
    ReturnType,
    TypeKind,
    TypeMap,
} from "../../../Type";
import {TYPE} from "../../../Type/const";
import {ScalarTypeTransform} from "../ScalarTypeTransform";
import {GQLTransform} from "./GQLTransform";

export class GQLTypeResolve {
    protected scalar = new ScalarTypeTransform();

    protected types: XMap<string, TypeMap>;

    protected context: GQLTransform;

    constructor(context: GQLTransform, types: XMap<string, TypeMap>) {
        this.context = context;
        this.types = types;
    }

    public resolve(of: ITypeObject, property: PropertyType): string | undefined {
        if (property.kind === PropertyKind.SCALAR) {
            ok(
                this.scalar.has(property.type),
                `Wrong scalar type ${property.type} of ${of.name}.${property.name}`,
            );

            return this.scalar.transform(property.type)
                .toString();
        }

        if (property.kind === PropertyKind.REFERENCE) {
            return this.getReferenceType(of, property);
        }

        if (property.kind === PropertyKind.FUNCTION) {
            return this.getFunctionType(of, property);
        }

        return;
    }

    protected getReferenceType(of: ITypeObject, property: IPropertyReference) {
        if (property.reference === TYPE.ARRAY) {
            return `[${this.resolve(of, property.parameters[0])}!]`;
        }

        if (ReturnType.has(property.reference)) {
            return this.resolve(of, property.parameters[0]);
        }

        if (this.scalar.has(property.reference)) {
            return this.scalar.transform(property.reference).name;
        }

        if (this.types.has(property.reference)) {
            const type = this.types.ensure(property.reference);
            if (type.kind === TypeKind.INTERFACE) {
                return this.context.createTypeByInterface(of, property, type);
            }

            if (type.kind === TypeKind.CLASS || type.kind === TypeKind.ENUM) {
                return type.name;
            }
        }
    }

    protected getFunctionType(of: ITypeObject, property: IPropertyFunction) {
        return this.resolve(of, property.returns);
    }
}
