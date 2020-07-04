import {Subscription, SubscriptionType} from "@graphly/type";
import {Todo} from "./Query/Todo";
import {TestContext} from "./TestContext";

export class TestSubscription extends SubscriptionType {
    public onTodoAdded(context: TestContext): Subscription<Todo> {
        const {todos} = context;
        return this.$resolve(todos.subscribe("add"));
    }

    public onTodoUpdate(context: TestContext): Subscription<Todo> {
        const {todos} = context;
        return this.$resolve(todos.subscribe("update"));
    }

    public onTodoDelete(context: TestContext): Subscription<Todo> {
        const {todos} = context;
        return this.$resolve(todos.subscribe("delete"));
    }
}
