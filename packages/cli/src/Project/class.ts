import {TypeKind} from "@graphly/schema";
import {JSONOutput} from "typedoc";
import {
    assert,
    getBase,
    getParent,
    getSource,
    isClassAbstract,
    isEnumMember,
    isInterface,
    TypeToTypeMap,
} from "./common";
import {getPropertyArrayConfig} from "./prop";

export const getTypeConfig: TypeToTypeMap = (reflection: JSONOutput.DeclarationReflection, {base}) => {
    assert(reflection.extendedTypes, `${reflection.name} should extending one of base type`);
    const {name} = reflection;
    const kind = isInterface(reflection)
        ? TypeKind.INTERFACE
        : (isClassAbstract(reflection) ? TypeKind.ABSTRACT : TypeKind.CLASS);

    return {
        kind,
        name,
        base: getBase(reflection),
        file: getSource(reflection, base),
        reference: getParent(reflection),
        property: [...getPropertyArrayConfig(reflection)],
        parameter: reflection.typeParameter?.map((parameter) => parameter.name) ?? [],
    };
};

export const getServiceConfig: TypeToTypeMap = (reflection: JSONOutput.DeclarationReflection, {base}) => {
    return {
        kind: TypeKind.SERVICE,
        name: reflection.name,
        file: getSource(reflection, base),
        base: getBase(reflection),
    };
};

export const getEnumConfig: TypeToTypeMap = (reflection: JSONOutput.DeclarationReflection, {base}) => {
    return {
        name: reflection.name,
        kind: TypeKind.ENUM,
        file: getSource(reflection, base),
        property: getEnumMembersConfig(reflection),
    };
};

export function getEnumMembersConfig(reflection: JSONOutput.DeclarationReflection) {
    let index = 0;
    const members = {};
    const {children = []} = reflection;
    for (const member of children) {
        if (isEnumMember(member)) {
            Reflect.set(
                members,
                member.name,
                member.defaultValue ? JSON.parse(member.defaultValue) : index++,
            );
        }
    }

    return members;
}
