import {Composer, Project} from "@graphly/composer";
import {graphql} from "graphql";

describe("Composer", () => {
    const composer = new Composer({
        basePath: __dirname,
        schemaPath: "Schema/TestSchema.ts",
        verbose: true,
    });

    const project = composer.compose();

    test("createProject", () => {
        expect(project).toBeInstanceOf(Project);
    });

    test("toGraphQL", () => {
        expect(project.toGraphQL()).toMatchSnapshot();
    });

    test("query on schema", async () => {
        const schema = project.toSchema();
        const query = `query {optional random timestamp hello}`;
        const data = await graphql(schema, query);
        expect(data).toBe({data: null});
    });
});
