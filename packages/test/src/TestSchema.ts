import {Schema} from "@graphly/type";
import {TestMutation} from "./Schema/TestMutation";
import {TestQuery} from "./Schema/TestQuery";
import {TestSubscription} from "./Schema/TestSubscription";

export class TestSchema extends Schema {
    declare public readonly query: TestQuery;

    declare public readonly mutation: TestMutation;

    declare public readonly subscription: TestSubscription;

    public static getSchemaLocation(): string {
        return __filename;
    }
}
