import {Schema} from "@graphly/type";
import {TestMutation} from "./TestMutation";
import {TestQuery} from "./TestQuery";
import {TestSubscription} from "./TestSubscription";

export class TestSchema extends Schema {
    public readonly query: TestQuery;
    public readonly mutation: TestMutation;
    public readonly subscription: TestSubscription;
}
