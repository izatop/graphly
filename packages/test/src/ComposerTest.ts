import {Composer, Project} from "@graphly/composer";

test("Composer", async () => {
    const composer = new Composer({
        basePath: __dirname,
        schemaPath: "Schema/TestSchema.ts",
        verbose: true,
    });

    const project = composer.createProject();
    expect(project).toBeInstanceOf(Project);
    expect(await project.toGraphQL())
        .not.toBeUndefined();
});
