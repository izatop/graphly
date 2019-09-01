import {clone} from "@sirian/clone";
import {ok} from "assert";
import {IProperty, IType, PropertyBox, PropertyType, TypeBaseClass} from "../../../Serialization/interfaces";
import {Boxes} from "../interfaces";
import {TransformAbstract} from "../TransformAbstract";
import {GQLTypeTransform} from "./GQLTypeTransform";

export class GQLPropertyTransform extends TransformAbstract<[GQLTypeTransform, IProperty], string> {
    public get typeTransform() {
        return this.context.typeTransform;
    }

    public get context() {
        return this.args[0];
    }

    public get property() {
        return this.args[1];
    }

    public get type() {
        return this.context.type;
    }

    public get types() {
        return this.context.context.types;
    }

    public transform(): string {
        const {type} = this.property;
        return this.getTypeOf(type);
    }

    protected resolveType(type: string) {
        if (this.types.has(type)) {
            const declaration = this.types.get(type)!;
            ok(declaration.base in TypeBaseClass, `Type ${type} should implement one of base type`);

            if (declaration.base === TypeBaseClass.InterfaceType) {
                return "InterfaceType";
            }
        }

        if (this.typeTransform.has(type)) {
            return this.typeTransform.transform(type);
        }

        return type;
    }

    protected transformPropertyBox(boxedType: PropertyBox): string {
        const {type, args} = boxedType;
        const [parameter, ...parameters] = args;

        if (!(type in Boxes) && this.types.has(type)) {
            const declaration = this.types.get(type)!;
            if (declaration.base === TypeBaseClass.InterfaceType) {
                return this.getInterfaceType(declaration, parameter, ...parameters);
            }
        }

        if (type === Boxes.Array) {
            return this.getTypeOfArray(parameter);
        }

        return this.getTypeOf(parameter);
    }

    protected getPropertyReplacement(parameters: Map<string, PropertyType>, type: PropertyType): PropertyType {
        if (this.isPropertyBox(type)) {
            const args = type.args.map((t) => this.getPropertyReplacement(parameters, t));
            return new PropertyBox(
                type.type,
                ...args as [PropertyType, ...PropertyType[]],
            );
        }

        if (typeof type === "string" && parameters.has(type)) {
            return parameters.get(type)!;
        }

        return type;
    }

    protected getInterfaceType(declaration: IType, ...types: PropertyType[]) {
        const name = this.getNameOfTypes(this.type.name, this.property.name);
        const property: IProperty[] = [];
        if (declaration.parameter) {
            const parameters = new Map<string, PropertyType>();
            for (let i = 0; i < declaration.parameter.length; i++) {
                const placeholder = declaration.parameter[i];
                ok(types[i], `Interface ${declaration.name} requires ${placeholder} parameter`);
                parameters.set(placeholder, types[i]);
            }

            for (const originalProperty of declaration.property) {
                const nextProperty = clone(originalProperty);
                nextProperty.type = this.getPropertyReplacement(parameters, nextProperty.type);
                property.push(nextProperty);
            }
        }

        const newType: IType = {
            name,
            property,
            base: this.type.base,
            file: this.type.file,
            reference: this.type.reference,
        };

        this.context.context.emit(newType);

        return name;
    }

    protected getTypeOf(type: PropertyType) {
        if (this.isPropertyBox(type)) {
            return this.transformPropertyBox(type);
        }

        if (typeof type === "string") {
            return this.resolveType(type);
        }

        return "???";
    }

    protected getTypeOfArray(type: PropertyType) {
        if (this.isPropertyBox(type)) {
            return `[${this.transformPropertyBox(type)}!]`;
        }

        if (typeof type === "string") {
            return `[${this.resolveType(type)}!]`;
        }

        return "[???]";
    }

    protected isPropertyBox(type: PropertyType): type is PropertyBox {
        return typeof type !== "string" && type instanceof PropertyBox;
    }

    protected getNameOfTypes(...types: string[]) {
        return types.map((type) => type.substr(0, 1).toUpperCase() + type.substr(1))
            .join("");
    }
}
