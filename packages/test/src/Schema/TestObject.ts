import {ObjectType, TypeInt} from "@graphly/type";

export class TestObject extends ObjectType {
    public readonly flag: boolean;
    public readonly selectors: TypeInt[] = [];
    public readonly n?: string;
}
