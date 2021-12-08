import {PropertyKind} from "./PropertyKind";
import {TypeKind} from "./TypeKind";

export interface IType<K extends TypeKind = TypeKind> {
    file: {
        source: string;
        target: string;
    };
    name: string;
    kind: K;
}

export interface ITypeObject extends IType<TypeKind.CLASS | TypeKind.ABSTRACT | TypeKind.INTERFACE> {
    base: string;
    reference?: string;
    parameter?: string[];
    property: PropertyType[];
}

export interface ITypeService extends IType<TypeKind.SERVICE> {
    base: string;
}

export interface ITypeEnum extends IType<TypeKind.ENUM> {
    property: {[key: string]: string | number};
}

export interface IProperty {
    name: string;
    nullable?: boolean;
    defaultValue?: string;
    kind: PropertyKind;
}

export interface IPropertyNever extends IProperty {
    kind: PropertyKind.NEVER;
}

export interface IPropertyScalar extends IProperty {
    kind: PropertyKind.SCALAR;
    type: string;
}

export interface IPropertyReference extends IProperty {
    kind: PropertyKind.REFERENCE;
    reference: string;
    parameters: PropertyType[];
}

export interface IPropertyParameter extends IProperty {
    kind: PropertyKind.PARAMETER;
    parameter: string;
    constraint?: object;
}

export interface IPropertyUnion extends IProperty {
    kind: PropertyKind.UNION;
    references: IPropertyReference[];
}

export interface IPropertyFunction extends IProperty {
    kind: PropertyKind.FUNCTION;
    returns: PropertyType;
    args: PropertyType[];
}

export type TypeMap = ITypeObject | ITypeEnum | ITypeService;
export type PropertyType = IPropertyNever
| IPropertyScalar
| IPropertyReference
| IPropertyParameter
| IPropertyFunction
| IPropertyUnion
    ;
