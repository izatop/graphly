import {Lookup, ObjectType, Returns, ReturnsNullable, TypeInt} from "@graphly/type";
import {MainContainer} from "../../MainContainer";
import {TodoInput} from "../Input/TodoInput";
import {Todo} from "../Query/Todo";
import {TestContext} from "../TestContext";

export class TodoMutation extends ObjectType {
    public add(todo: TodoInput, context: TestContext): Returns<Todo> {
        return context.todos.add(todo);
    }

    public update(id: TypeInt, todo: TodoInput, context: TestContext): ReturnsNullable<Todo> {
        return context.todos.update(id, todo);
    }

    public delete(id: TypeInt[], container: Lookup<MainContainer>): Returns<boolean[]> {
        const {repository} = container;
        const todos = repository.get("todos");
        const ops = [];
        for (const i of id) {
            ops.push(todos.delete(i));
        }

        return Promise.all(ops);
    }
}
