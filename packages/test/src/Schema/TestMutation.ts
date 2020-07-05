import {ObjectType} from "@graphly/type";
import {TestObjectInput} from "./Input/TestObjectInput";
import {TodoMutation} from "./Mutation/TodoMutation";

export class TestMutation extends ObjectType {
    public todo: TodoMutation;

    public test(value: TestObjectInput = {enabled: true}): boolean {
        return value.enabled;
    }
}
