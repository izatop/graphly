// tslint:disable:no-bitwise
import {ITypeObject, TypeBase, TypeKind, TypeMap, TypeService} from "@graphly/schema";
import {assert} from "@sirian/assert";
import {JSONOutput, ReflectionKind} from "typedoc";
import {Project} from "./Project";

export type TypeToTypeMap = <T extends JSONOutput.Reflection>(type: T, project: Project) => TypeMap;

export const inheritances = new Map<string, string>();

export function isContainerReflection(input: JSONOutput.Reflection): input is JSONOutput.ContainerReflection {
    return input.kind === ReflectionKind.Module;
}

export function isReferenceType(input: JSONOutput.Reflection): input is JSONOutput.Reflection {
    return (ReflectionKind.ClassOrInterface & input.kind) === input.kind
        || (ReflectionKind.Enum & input.kind) === input.kind;
}

export function isExtendableType(input: JSONOutput.Reflection): input is JSONOutput.DeclarationReflection {
    return isClass(input) || isClassAbstract(input) || isInterface(input);
}

export function isAccessor(input: JSONOutput.Reflection): input is JSONOutput.DeclarationReflection {
    return input.kind === ReflectionKind.Accessor;
}

export function isMethod(input: JSONOutput.Reflection): input is JSONOutput.DeclarationReflection {
    return input.kind === ReflectionKind.Method;
}

export function isInterface(input: JSONOutput.Reflection): input is JSONOutput.DeclarationReflection {
    return input.kind === ReflectionKind.Interface;
}

export function isClass(input: JSONOutput.Reflection): input is JSONOutput.DeclarationReflection {
    return input.kind === ReflectionKind.Class;
}

export function isClassAbstract(input: JSONOutput.Reflection): input is JSONOutput.DeclarationReflection {
    return input.kind === ReflectionKind.Class
        && input.flags.isAbstract === true;
}

export function isProperty(input: JSONOutput.Reflection): input is JSONOutput.DeclarationReflection {
    return input.kind === ReflectionKind.Property;
}

export function isEnum(input: JSONOutput.Reflection): input is JSONOutput.DeclarationReflection {
    return input.kind === ReflectionKind.Enum;
}

export function isEnumMember(input: JSONOutput.Reflection): input is JSONOutput.DeclarationReflection {
    return input.kind === ReflectionKind.EnumMember;
}

export function isType(child: JSONOutput.DeclarationReflection) {
    return (isClass(child) || isInterface(child)) && hasParents(child);
}

export function isService(child: JSONOutput.DeclarationReflection) {
    return (isClass(child) || isInterface(child))
        && hasParents(child)
        && TypeService.has(getBase(child));
}

export function hasParents(child: { extendedTypes?: JSONOutput.Type[] }) {
    return getParents(child).length > 0;
}

export function getParents({extendedTypes = []}: { extendedTypes?: JSONOutput.Type[] }) {
    const parents: string[] = [];
    for (const type of extendedTypes) {
        if (isReference(type)) {
            parents.push(type.name);
        }
    }

    return parents;
}

export function getBase(child: { extendedTypes?: JSONOutput.Type[] }) {
    const parents = getParents(child);
    assert(parents.length > 0, "Type should have parent");
    let tail = parents[parents.length - 1];
    while (tail && !TypeBase.has(tail)) {
        const parent = inheritances.get(tail);
        if (!parent) {
            break;
        }

        tail = parent;
    }

    return tail;
}

const kinds = [TypeKind.CLASS, TypeKind.ABSTRACT, TypeKind.INTERFACE];
export const isTypeMapReference = (value: TypeMap): value is ITypeObject => kinds.includes(value.kind);

export function getTypeMapBase(value: ITypeObject, map: Map<string, TypeMap>): string {
    if (TypeBase.has(value.base)) {
        return value.base;
    }

    const type = map.get(value.base);
    assert(type && isTypeMapReference(type), `Wrong reference type ${value.name} of ${value.base}`);
    return getTypeMapBase(type, map);
}

export function getParent(child: { extendedTypes?: JSONOutput.Type[] }) {
    const parents = getParents(child);
    assert(parents.length > 0, "Type should have parent");
    return parents[0];
}

export function getSource(input: JSONOutput.ContainerReflection) {
    assert(input.sources && input.sources.length, `${input.name} should have source`);
    const [source] = input.sources;
    const file = source.fileName;
    return {
        source: file,
        target: file.replace(/\.[a-z]+$/, ""),
    };
}

export function isReference(type: any): type is JSONOutput.ReferenceType {
    return isObject<JSONOutput.ReferenceType>(type) && "type" in type
        && type.type === "reference";
}

export function isReflection(type: any): type is JSONOutput.ReflectionType {
    return isObject<JSONOutput.ReflectionType>(type) && "type" in type
        && type.type === "reflection";
}

export function isIntrinsic(type: any): type is JSONOutput.IntrinsicType {
    return isObject<JSONOutput.IntrinsicType>(type) && "type" in type
        && type.type === "intrinsic";
}

export function isTypeParameter(type: any): type is JSONOutput.TypeParameterType {
    return isObject<JSONOutput.TypeParameterType>(type) && "type" in type
        && type.type === "typeParameter";
}

export function isArray(type: any): type is JSONOutput.ArrayType {
    return isObject<JSONOutput.ArrayType>(type) && "type" in type
        && type.type === "array";
}

export function isUnion(type: any): type is JSONOutput.UnionType {
    return isObject<JSONOutput.UnionType>(type) && "type" in type
        && type.type === "union";
}

export function isObject<T extends object>(value: any): value is T {
    return typeof value === "object" && !!value;
}

