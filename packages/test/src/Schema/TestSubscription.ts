import {$subscribe, Subscription, SubscriptionType} from "@graphly/type";
import {Todo} from "./Query/Todo";
import {TestContext} from "./TestContext";

export class TestSubscription extends SubscriptionType {
    public onTodoAdded(context: TestContext): Subscription<Todo> {
        const {todos} = context;
        return $subscribe(todos.subscribe("add"));
    }

    public onTodoUpdate(context: TestContext): Subscription<Todo> {
        const {todos} = context;
        return $subscribe(todos.subscribe("update"));
    }

    public onTodoDelete(context: TestContext): Subscription<Todo> {
        const {todos} = context;
        return $subscribe(todos.subscribe("delete"));
    }
}
