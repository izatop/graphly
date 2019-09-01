import {MutationType} from "@graphly/type";
import {TodoMutation} from "./Mutation/TodoMutation";

export class TestMutation extends MutationType {
    public todo: TodoMutation;
}
