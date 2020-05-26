import {Project} from "@graphly/schema";
import {GraphQLSchema} from "graphql";
import {TestSchema} from "./TestSchema";

test("Composer", async () => {
    const project = await Project.from(TestSchema.getSchemaLocation());
    expect(project.toGraphQL()).toMatchSnapshot();
    expect(project.toSchema()).toBeInstanceOf(GraphQLSchema);
});
