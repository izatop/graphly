import {Schema} from "@graphly/type";
import {TestMutation} from "./Schema/TestMutation";
import {TestQuery} from "./Schema/TestQuery";
import {TestSubscription} from "./Schema/TestSubscription";

export class TestSchema extends Schema {
    public readonly query: TestQuery;

    public readonly mutation: TestMutation;

    public readonly subscription: TestSubscription;

    public static getSchemaLocation() {
        return __filename;
    }
}
