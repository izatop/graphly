import {$async, $map, Lookup, ObjectType, Returns, ReturnsNullable, TypeInt} from "@graphly/type";
import {MainContainer} from "../../MainContainer";
import {ITodo, TodoStatus} from "../../Repository/ITodo";
import {TodoSearchInput} from "../Input/TodoSearchInput";
import {TestContext} from "../TestContext";
import {IPageable} from "./IPageable";
import {Todo} from "./Todo";

export class TodoQuery extends ObjectType {
    public async todo(id: TypeInt, container: Lookup<MainContainer>): ReturnsNullable<Todo> {
        const {repository} = container;
        return $async(repository.get<ITodo>("todos").findOne(id));
    }

    public async searchAll(limit = 10, offset = 0, context: TestContext): Returns<IPageable<Todo>> {
        const {todos} = context;
        const todosQuery = await todos.find();

        return {
            limit,
            offset,
            count: todosQuery.length,
            node: $map(todosQuery.slice(offset, offset + limit)),
        };
    }

    public async search(context: TestContext, filter?: TodoSearchInput): Returns<IPageable<Todo>> {
        const {todos} = context;
        let todosQuery = await todos.find();

        const {status, limit, offset} = filter || new TodoSearchInput();
        if (status && status in TodoStatus) {
            todosQuery = todosQuery.filter((item) => item.status === status);
        }

        return {
            limit,
            offset,
            count: todosQuery.length,
            node: $map(todosQuery.slice(offset, offset + limit)),
        };
    }

    public async count(context: TestContext, status: TodoStatus = TodoStatus.DONE): Promise<TypeInt> {
        const {todos} = context;
        let todosQuery = await todos.find();

        todosQuery = todosQuery.filter((item) => item.status === status);

        return todosQuery.length;
    }
}
