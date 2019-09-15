import {Lookup, ObjectType, TypeInt} from "@graphly/type";
import {TodoInput} from "../Input/TodoInput";
import {TestContainer} from "../TestContainer";
import {TestContext} from "../TestContext";

export class TodoMutation extends ObjectType {
    public add(todo: TodoInput, context: TestContext) {
        return context.todos.add(todo);
    }

    public update(id: TypeInt, todo: TodoInput, context: TestContext) {
        return context.todos.update(id, todo);
    }

    public delete(id: TypeInt[], container: Lookup<TestContainer>) {
        const {repository} = container;
        const todos = repository.get("todos");
        const ops = [];
        for (const i of id) {
            ops.push(todos.delete(i));
        }

        return Promise.all(ops);
    }
}
