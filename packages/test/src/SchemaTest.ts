import {Composer} from "@graphly/cli";
import {KeyValue, Scope} from "@graphly/type";
import {graphql} from "graphql";
import {TestRepository} from "./Repository/TestRepository";
import {TodoInput} from "./Schema/Input/TodoInput";
import {TestContainer} from "./Schema/TestContainer";
import {TestContext} from "./Schema/TestContext";
import {TestSchema} from "./Schema/TestSchema";

const todoFragment = `
fragment TodoFragment on Todo { id title description solved deadlineAt checklist { text solved } }
`;

const todoTodoQuery = `
query TodoQuery ($id: Int!) {
    todo {
        todo(id: $id) { ...TodoFragment }
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
        container: TestContainer,
        config,
    });

    const runQuery = async (q: string, v?: KeyValue) => {
        const state = {timestamp: Date.now()};
        const {schema, context, rootValue} = await scope.createConfig(state);
        return graphql(schema, q, rootValue, context, v);
    };

    test("Test Context", async () => {
        const state = {timestamp: Date.now()};
        const {context} = await scope.createConfig(state);
        expect(context.container.repository).toBeInstanceOf(TestRepository);
        expect(context.container.config).toMatchObject(config);
        expect(context.container.config).toBe(context.getConfig());
        expect(context.state).toMatchObject(state);
    });

    test("Schema query", async () => {
        const query = `query {optional random timestamp hello}`;
        const {data} = await runQuery(query);
        expect(data!.optional).toBe(null);
        expect(typeof data!.random).toBe("number");
        expect(typeof data!.timestamp).toBe("number");
        expect(data!.hello).toBe("Hello world");

        const todo: TodoInput = {
            checklist: [],
            deadlineAt: new Date(),
            title: "New Todo",
            solved: false,
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
            solved: true,
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
});
