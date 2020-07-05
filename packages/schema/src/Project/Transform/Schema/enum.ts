import {assert} from "@sirian/assert";
import {TypeKind, TypeMap} from "../../../Type";

export function tryToGetEnumDefaultValue(value: string, reference?: TypeMap) {
    assert(
        reference && reference.kind === TypeKind.ENUM,
        "Only an enum should be used as a default value",
    );

    const {name, property} = reference;
    const values = new Map(
        Object.keys(property)
            .map((key) => [`${name}.${key}`, key]),
    );

    assert(values.has(value), `Unknown enum key ${value}`);
    return values.get(value);
}
