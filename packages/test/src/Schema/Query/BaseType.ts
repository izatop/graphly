import {ObjectType, TypeInt} from "@graphly/type";

export abstract class BaseType extends ObjectType {
    public readonly id: TypeInt;

    public get code() {
        return "code" + this.id.toString();
    }
}
