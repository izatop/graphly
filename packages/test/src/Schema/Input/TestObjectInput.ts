import {InputObjectType} from "@graphly/type";

export class TestObjectInput extends InputObjectType {
    public readonly filter?: string;
    public readonly enabled: boolean = true;
}
