import {Composer} from "@graphly/cli";
import {TodoStatus} from "@graphly/todo";
import {Scope} from "@graphly/type";
import {graphql} from "graphql";
import {MainContainer} from "./MainContainer";
import {TestRepository} from "./Repository/TestRepository";
import {TodoInput} from "./Schema/Input/TodoInput";
import {TestContext} from "./Schema/TestContext";
import {TestSchema} from "./TestSchema";

const todoFragment = `
fragment TodoFragment on Todo { id code title description status deadlineAt checklist { text solved } }
`;

const todoTodoQuery = `
query TodoQuery ($id: Int!) {
    todo {
        todo(id: $id) { ...TodoFragment }
    }
}
${todoFragment}
`;

const todoTodoSearchQuery = `
query TodoSearchQuery {
    todo {
        search { node {...TodoFragment} }
    }
}
${todoFragment}
`;

const todoTodoSearchAllQuery = `
query TodoSearchQueryAll {
    todo {
        searchAll { node {...TodoFragment} }
    }
}
${todoFragment}
`;

const todoCountQuery = `
query TodoCountQuery {
    todo {
        count
    }
}
`;

const addTodoQuery = `
mutation addTodo($todo: TodoInput!) {
    todo { add(todo: $todo) { ...TodoFragment } }
}
${todoFragment}
`;

const updateTodoQuery = `
mutation updateTodo($id: Int! $todo: TodoInput!) {
    todo { update(id: $id todo: $todo) { ...TodoFragment } }
}
${todoFragment}
`;

describe("Composer", () => {
    const config = {
        dsn: "connection string",
    };

    const scope = new Scope({
        schema: TestSchema,
        context: TestContext,
        container: MainContainer,
        config,
    });

    const runQuery = async (q: string, v?: Record<string, any>) => {
        const state = {timestamp: Date.now(), authorized: false, session: ""};
        const factory = await scope.create(() => state);
        const {schema, contextValue, rootValue} = await factory(undefined);
        return graphql(schema, q, rootValue, contextValue, v);
    };

    test("Test Context", async () => {
        const state = {timestamp: Date.now(), authorized: false, session: ""};
        const factory = await scope.create(() => state);
        const {contextValue, rootValue} = await factory(undefined, {test: true});
        expect(contextValue.container.repository).toBeInstanceOf(TestRepository);
        expect(contextValue.container.config).toMatchObject(config);
        expect(contextValue.container.config).toBe(contextValue.getConfig());
        expect(contextValue.state).toMatchObject(state);
        expect(rootValue).toMatchObject({test: true});
    });

    test("Schema query", async () => {
        const query = `query {optional random timestamp hello}`;
        const {data} = await runQuery(query);
        expect(data?.optional).toBe(null);
        expect(typeof data?.random).toBe("number");
        expect(typeof data?.timestamp).toBe("number");
        expect(data?.hello).toBe("Hello world");

        const todo: TodoInput = {
            checklist: [],
            deadlineAt: new Date(),
            title: "New Todo",
            status: TodoStatus.PENDING,
        };

        const add = await runQuery(addTodoQuery, {todo});
        expect(add.errors).toBeUndefined();
        expect(add.data).toMatchObject({
            todo: {
                add: {
                    ...todo,
                    id: 1,
                    deadlineAt: todo.deadlineAt!.getTime(),
                    description: null,
                },
            },
        });

        const todoQuery = await runQuery(todoTodoQuery, {id: 1});
        const {repository} = await scope.createContainer();
        const firstTodo = repository.get("todos").findOne(1);

        expect(todoQuery.errors).toBeUndefined();
        expect(todoQuery.data).toMatchObject({
            todo: {
                todo: firstTodo,
            },
        });

        const updateTodo: TodoInput = {
            ...todo,
            checklist: [{text: "Checklist 1", solved: true}],
            description: "Description",
            deadlineAt: new Date(),
            status: TodoStatus.DONE,
        };

        const update = await runQuery(updateTodoQuery, {id: 1, todo: updateTodo});
        expect(update.errors).toBeUndefined();
        expect(update.data).toMatchObject({
            todo: {
                update: {
                    ...updateTodo,
                    deadlineAt: updateTodo.deadlineAt!.getTime(),
                    id: 1,
                },
            },
        });

        const nullableQueryTest = await runQuery(todoTodoQuery, {id: 999});
        expect(nullableQueryTest.errors).toBeUndefined();
        expect(nullableQueryTest.data).toMatchObject({todo: {todo: null}});

        const todoCount = await runQuery(todoCountQuery);
        expect(todoCount.errors).toBeUndefined();
        expect(todoCount.data).toMatchObject({todo: {count: 1}});
    });

    const iPageableTestQuery = [todoTodoSearchQuery, todoTodoSearchAllQuery];
    test.each(iPageableTestQuery)("IPageable", async (q) => {
        const query = await runQuery(q);
        expect(query.errors).toBeUndefined();
    });
});
