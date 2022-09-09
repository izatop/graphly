import {ObjectType} from "@graphly/type";
import {TestObjectInput} from "./Input/TestObjectInput";
import {TodoMutation} from "./Mutation/TodoMutation";

export class TestMutation extends ObjectType {
    declare public readonly todo: TodoMutation;

    public test(value: TestObjectInput = {enabled: true, filter: "foo"}): boolean {
        return value.enabled;
    }
}
