import {ObjectType} from "@graphly/type";
import {TodoMutation} from "./Mutation/TodoMutation";

export class TestMutation extends ObjectType {
    public todo: TodoMutation;
}
