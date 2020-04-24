import {assert} from "@sirian/assert";
import {XMap} from "@sirian/common";
import {memoize} from "@sirian/decorators";
import {
    InputType,
    IPropertyReference,
    ITypeEnum,
    ITypeObject,
    OutputType,
    PropertyKind,
    PropertyType,
    TYPE,
    TypeKind,
    TypeMap,
} from "../../../Type";
import {ucfirst} from "../../../util/ucfirst";
import {Project} from "../../Project";
import {InterfaceType} from "../InterfaceType";
import {TransformAbstract} from "../TransformAbstract";
import {GQLEnumTypeTransform} from "./GQLEnumTypeTransform";
import {GQLInputTypeTransform} from "./GQLInputTypeTransform";
import {GQLQueryTypeTransform} from "./GQLQueryTypeTransform";
import {GQLSchemaTransform} from "./GQLSchemaTransform";
import {GQLTypeResolve} from "./GQLTypeResolve";

export class GQLTransform extends TransformAbstract<[Project], string> {
    protected segments: string[] = [];

    @memoize
    public get resolver() {
        return new GQLTypeResolve(this, this.types);
    }

    public get types() {
        return this.args[0].types;
    }

    public emit(type: ITypeObject | ITypeEnum) {
        const ctor = this.getTransformClass(type);
        if (ctor) {
            return this.segments.push(ctor.transform());
        }

        this.warning(new Error(`Cannot transform type ${type.name}`));
    }

    public getTransformClass(type: ITypeObject | ITypeEnum) {
        if (type.kind === TypeKind.ENUM) {
            return new GQLEnumTypeTransform(type);
        }

        if (type.kind === TypeKind.CLASS && type.base === TYPE.SCHEMA) {
            return new GQLSchemaTransform(this, type);
        }

        if (type.kind === TypeKind.CLASS && OutputType.has(type.base)) {
            return new GQLQueryTypeTransform(this, type);
        }

        if (type.kind === TypeKind.CLASS && InputType.has(type.base)) {
            return new GQLInputTypeTransform(this, type);
        }
    }

    public isTransformable(type: TypeMap): type is ITypeObject | ITypeEnum {
        return type.kind === TypeKind.CLASS
            || type.kind === TypeKind.ENUM;
    }

    public transform() {
        this.segments.push(`scalar DateTime\nscalar Object`);
        const isSchema = (type: TypeMap) => type.kind === TypeKind.CLASS && type.base === TYPE.SCHEMA;
        const isNotTheSchema = (type: TypeMap) => !isSchema(type);
        const values = [...this.types.values()];
        const schema = values.find(isSchema);
        assert(schema && this.isTransformable(schema), "The Schema doesn't exists");

        for (const type of values.filter(isNotTheSchema)) {
            if (this.isTransformable(type)) {
                this.emit(type);
            }
        }

        this.emit(schema);

        return this.segments.join("\n\n");
    }

    public createTypeByInterface(parent: ITypeObject, property: IPropertyReference, interfaceType: ITypeObject) {
        const nameChain = [];
        const interfaceReferences = property.parameters
            .filter((p) => p.kind === PropertyKind.REFERENCE) as IPropertyReference[];

        if (interfaceReferences.length === 0) {
            nameChain.push(parent.name, property.name);
        }

        if (interfaceReferences.length > 0) {
            nameChain.push(
                interfaceType.name,
                ...interfaceReferences.map((p) => p.reference),
            );
        }

        const interfaceName = nameChain.map(ucfirst)
            .join("");

        if (this.types.has(interfaceName)) {
            return interfaceName;
        }

        const map = new XMap<string, PropertyType>();
        if (interfaceType.parameter) {
            for (const [index, parameter] of interfaceType.parameter.entries()) {
                map.set(parameter, property.parameters[index]);
            }
        }

        const nextProperty: PropertyType[] = [];
        for (const p of interfaceType.property) {
            nextProperty.push(InterfaceType.replaceTypeParameter(map, p));
        }

        const nextType: ITypeObject = {
            name: interfaceName,
            kind: TypeKind.CLASS,
            file: interfaceType.file,
            base: interfaceType.base,
            reference: interfaceType.base,
            property: nextProperty,
            parameter: interfaceType.parameter,
        };

        this.types.set(nextType.name, nextType);
        this.emit(nextType);

        return nextType.name;
    }
}
