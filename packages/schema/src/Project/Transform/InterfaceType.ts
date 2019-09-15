import {XMap} from "@sirian/common";
import {PropertyKind, PropertyType} from "../../Type";

export class InterfaceType {
    public static replaceTypeParameter(map: XMap<string, PropertyType>, property: PropertyType): PropertyType {
        if (property.kind === PropertyKind.PARAMETER) {
            const type = map.get(property.parameter);
            if (type) {
                return type;
            }
        }

        if (property.kind === PropertyKind.REFERENCE) {
            if (property.parameters.length > 0) {
                const parameters = property.parameters.map((parameter) => (
                    this.replaceTypeParameter(map, parameter)
                ));

                return {kind: PropertyKind.REFERENCE, ...property, parameters};
            }
        }

        return property;
    }
}
