import {IPropertyFunction, IPropertyScalar, NullableType, PropertyKind, PropertyType, TYPE} from "@graphly/schema";
import {assert} from "@sirian/assert";
import {JSONOutput} from "typedoc";
import {
    isAccessor,
    isArray,
    isIntrinsic,
    isMethod,
    isProperty,
    isReference,
    isReflection,
    isTypeParameter,
    isUnion,
} from "./common";

type PropertyReflection = Pick<JSONOutput.DeclarationReflection, "flags" | "name" | "type" | "defaultValue">;
type AccessorReflection = Pick<JSONOutput.DeclarationReflection, "getSignature" | "flags" | "name" | "type" | "defaultValue">;
type MethodReflection = Pick<JSONOutput.DeclarationReflection, "signatures" | "flags" | "name" | "type" | "defaultValue">;
type UnionReflection = Pick<JSONOutput.DeclarationReflection, "flags" | "name" | "defaultValue">
& {type: JSONOutput.UnionType};

type ParameterReflection = Pick<JSONOutput.DeclarationReflection, "name" | "flags" | "defaultValue">
& {type: JSONOutput.TypeParameterType};

const isScalar = (item: PropertyType): item is IPropertyScalar => item.kind === PropertyKind.SCALAR;
const isUndefined = (item: PropertyType): item is IPropertyScalar => isScalar(item) && item.type === "undefined";
const isBoolean = (item: PropertyType): item is IPropertyScalar => isScalar(item) && "true,false".includes(item.type);

export function* getPropertyArrayConfig(reflection: JSONOutput.DeclarationReflection): IterableIterator<PropertyType> {
    for (const child of reflection.children ?? []) {
        const {flags} = child;
        if (flags.isPrivate || flags.isProtected || flags.isStatic) {
            continue;
        }

        if (isAccessor(child)) {
            const property = getAccessorConfig(child);
            if (property) {
                yield property;
            }

            continue;
        }

        if (isMethod(child)) {
            const property = getMethodConfig(child);
            if (property) {
                yield property;
            }

            continue;
        }

        if (isProperty(child)) {
            const property = getPropertyConfig(child);
            if (property) {
                yield property;
            }
        }
    }
}

export function getMethodConfig(reflection: MethodReflection): IPropertyFunction {
    const {name, signatures = [], flags} = reflection;
    assert(signatures.length === 1, "Only one signature should be on method declaration");

    const args: PropertyType[] = [];
    const [signature] = signatures;
    const returns = getPropertyConfig({...signature, flags, name});

    for (const parameter of signature.parameters ?? []) {
        const {getSignature, ...arg} = parameter;
        args.push(getPropertyConfig(arg));
    }

    return {
        name,
        args,
        returns,
        kind: PropertyKind.FUNCTION,
        nullable: returns.nullable,
    };
}

export function getAccessorConfig(reflection: AccessorReflection): IPropertyFunction {
    const {name, flags, getSignature = []} = reflection;
    assert(getSignature.length === 1, "Accessor should have only one signature");

    const returns = getPropertyConfig({...getSignature[0], flags, name});
    return {
        name,
        returns,
        kind: PropertyKind.FUNCTION,
        nullable: returns.nullable,
        args: [],
    };
}

export function getTypeArguments(reflection: JSONOutput.ReferenceType): PropertyType[] {
    const parameters = [];
    const {name, typeArguments = []} = reflection;
    for (const parameter of typeArguments) {
        parameters.push(getPropertyConfig({name, type: parameter, flags: {}}));
    }

    return parameters;
}

export function getPropertyConfig(reflection: PropertyReflection): PropertyType {
    const {name, type, flags, defaultValue} = reflection;
    const nullable = flags.isOptional || false;

    if (isReference(type)) {
        return {
            name,
            defaultValue,
            nullable: NullableType.has(type.name) ? true : nullable,
            kind: PropertyKind.REFERENCE,
            reference: type.name,
            parameters: getTypeArguments({...type, name}),
        };
    }

    if (isIntrinsic(type)) {
        return {
            name,
            nullable,
            defaultValue,
            type: type.name,
            kind: PropertyKind.SCALAR,
        };
    }

    if (isArray(type)) {
        return {
            name,
            nullable,
            defaultValue,
            kind: PropertyKind.REFERENCE,
            reference: TYPE.ARRAY,
            parameters: [getPropertyConfig({name, flags, type: type.elementType})!],
        };
    }

    if (isUnion(type)) {
        return getUnionConfig({name, flags, defaultValue, type});
    }

    if (isTypeParameter(type)) {
        return getTypeParameter({name, flags, type, defaultValue});
    }

    if (isReflection(type)) {
        return {
            name,
            nullable,
            defaultValue,
            kind: PropertyKind.NEVER,
        };
    }

    throw new Error(`Unknown type ${name} ${type?.type}`);
}

export function getUnionConfig(reflection: UnionReflection): PropertyType {
    const {name, defaultValue, flags, type: {types}} = reflection;
    const property: PropertyType[] = [];
    for (const child of types) {
        property.push(
            getPropertyConfig({name, flags, type: child})!,
        );
    }

    const hasUndefined = property.some(isUndefined);
    const nullable = hasUndefined || flags.isOptional || false;
    if (hasUndefined && types.length === 2) {
        return getPropertyConfig({
            name,
            type: types.find((child) => !(isIntrinsic(child) && child.name === "undefined")),
            defaultValue,
            flags: {...flags, isOptional: nullable},
        })!;
    }

    const booleanOnly = property.every((item) => isBoolean(item) || isUndefined(item));
    assert(booleanOnly, "An union type should be boolean");

    return {
        name,
        nullable,
        defaultValue,
        type: "boolean",
        kind: PropertyKind.SCALAR,
    };
}

export function getTypeParameter(reflection: ParameterReflection): PropertyType {
    const {type, name, flags, defaultValue} = reflection;
    assert(!type.constraint || isReference(type.constraint), "Wrong type parameter reference");

    return {
        name,
        defaultValue,
        kind: PropertyKind.PARAMETER,
        parameter: type.name,
        constraint: type.constraint,
        nullable: flags.isOptional || false,
    };
}
