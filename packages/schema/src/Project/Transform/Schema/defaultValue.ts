import {assert} from "@sirian/assert";
import * as vm from "vm";
import {IPropertyReference, ScalarType, TypeKind, TypeMap} from "../../../Type";

export function evaluateDefaultValue(property: IPropertyReference, reference?: TypeMap) {
    if (!property.defaultValue) {
        return undefined;
    }

    if (canEvaluate(property.reference, property.defaultValue)) {
        return vm.runInContext(`(${property.defaultValue})`, vm.createContext({}));
    }

    assert(
        reference && reference.kind === TypeKind.ENUM,
        "Only Enum or Scalar should be used as a default value",
    );

    const values = new Map(
        Object.keys(reference.property)
            .map((key) => [`${reference.name}.${key}`, key]),
    );

    assert(values.has(property.defaultValue), `Unknown ENUM ${property.defaultValue}`);
    return values.get(property.defaultValue);
}

function canEvaluate(reference: string, value: string) {
    return ScalarType.has(reference)
        || reference === "Array"
        || /^{.+}$/.test(value);
}
