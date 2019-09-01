import {Scope} from "@graphly/type";
import {TestContainer} from "./Schema/TestContainer";
import {TestContext} from "./Schema/TestContext";
import {TestSchema} from "./Schema/TestSchema";

test("Scope", async () => {
    const scope = new Scope({
        schema: new TestSchema(),
        container: TestContainer,
        context: TestContext,
    });
});
