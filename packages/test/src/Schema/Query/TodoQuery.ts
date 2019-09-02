import {Lookup, QueryType, TypeInt} from "@graphly/type";
import {TodoSearchInput} from "../Input/TodoSearchInput";
import {TestContainer} from "../TestContainer";
import {TestContext} from "../TestContext";
import {IPageable} from "./IPageable";
import {Todo} from "./Todo";

export class TodoQuery extends QueryType {
    public todo(id: TypeInt, container: Lookup<TestContainer>) {
        const {repository} = container;
        return repository.get<Todo>("todos")
            .findOne(id);
    }

    public async search(context: TestContext, filter?: TodoSearchInput): Promise<IPageable<Todo>> {
        const {todos} = context;
        let todosQuery = await todos.find();

        const {solved, limit, offset} = filter || new TodoSearchInput();
        if (typeof solved === "boolean") {
            todosQuery = todosQuery.filter((item) => item.solved === solved);
        }

        return {
            limit,
            offset,
            count: todosQuery.length,
            node: todosQuery.slice(offset, offset + limit),
        };
    }

    public async count(context: TestContext, solved: boolean = true): Promise<TypeInt> {
        const {todos} = context;
        let todosQuery = await todos.find();

        if (typeof solved === "boolean") {
            todosQuery = todosQuery.filter((item) => item.solved === solved);
        }

        return todosQuery.length;
    }
}
