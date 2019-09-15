import {Scope} from "@graphly/type";
import {TestContainer} from "./Schema/TestContainer";
import {TestContext} from "./Schema/TestContext";
import {TestSchema} from "./Schema/TestSchema";

test("Scope", async () => {
    const scope = new Scope({
        schema: TestSchema,
        context: TestContext,
        container: TestContainer,
        config: {},
    });

    const config = await scope.createConfig({});
    expect(config).toBeDefined();
});
