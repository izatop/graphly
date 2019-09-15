import {Composer, Project} from "@graphly/composer";
import {Lookup, resolve} from "@graphly/type";
import {graphql} from "graphql";
import {TodoInput} from "./Schema/Input/TodoInput";
import {Todo} from "./Schema/Query/Todo";
import {TestContainer} from "./Schema/TestContainer";
import {TestContext} from "./Schema/TestContext";

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
    const composer = new Composer({
        basePath: __dirname,
        schemaPath: "Schema/TestSchema.ts",
        verbose: false,
    });

    const project = composer.compose();
    let container: Lookup<TestContainer>;

    beforeAll(async () => {
        container = await resolve(new TestContainer({}));
        const todos = container.repository.get<Todo>("todos");
        await todos.add({
            deadlineAt: new Date(),
            description: "Description",
            solved: false,
            title: "Todo",
        });
    });

    test("Composer.compose()", () => {
        expect(project).toBeInstanceOf(Project);
    });

    test("Project.toGraphQL()", () => {
        expect(project.toGraphQL()).toMatchSnapshot();
    });

    test("Test repository", async () => {
        const todos = container.repository.get<Todo>("todos");
        const todosQuery = await todos.find();
        expect(todosQuery.length === 1);
        expect(todosQuery[0].id).toBe(1);
        expect(todosQuery[0].title).toBe("Todo");
    });

    test("Schema query", async () => {
        const schema = project.toSchema();
        const query = `query {optional random timestamp hello}`;
        const {data} = await graphql(schema, query, {});
        expect(data.optional).toBe(null);
        expect(typeof data.random).toBe("number");
        expect(typeof data.timestamp).toBe("number");
        expect(data.hello).toBe("Hello world");
    });

    test("Advanced query", async () => {
        const schema = project.toSchema();
        const query = (q: any, v: any) => graphql(schema, q, {}, context, v);
        const context = new TestContext(container, {});

        const todoQuery = await query(todoTodoQuery, {id: 1});
        const firstTodo = container.repository.get("todos").findOne(1);
        expect(todoQuery.errors).toBeUndefined();
        expect(todoQuery.data).toMatchObject({
            todo: {
                todo: firstTodo,
            },
        });

        const todo: TodoInput = {
            checklist: [],
            deadlineAt: new Date(),
            title: "New Todo",
            solved: false,
        };

        const add = await query(addTodoQuery, {todo});
        expect(add.errors).toBeUndefined();
        expect(add.data).toMatchObject({
            todo: {
                add: {
                    ...todo,
                    id: 2,
                    deadlineAt: todo.deadlineAt!.getTime(),
                    description: null,
                },
            },
        });

        const updateTodo: TodoInput = {
            ...todo,
            checklist: [{text: "Checklist 1", solved: true}],
            description: "Description",
            deadlineAt: new Date(),
            solved: true,
        };

        const update = await query(updateTodoQuery, {id: 2, todo: updateTodo});
        expect(update.errors).toBeUndefined();
        expect(update.data).toMatchObject({
            todo: {
                update: {
                    ...updateTodo,
                    deadlineAt: updateTodo.deadlineAt!.getTime(),
                    id: 2,
                },
            },
        });
    });
});
