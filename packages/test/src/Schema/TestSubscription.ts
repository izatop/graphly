import {$subscribe, Subscription, SubscriptionType} from "@graphly/type";
import {Todo} from "./Query/Todo";
import {TestContext} from "./TestContext";

export class TestSubscription extends SubscriptionType {
    public onTodoAdded(context: TestContext): Subscription<Todo> {
        const {todos} = context;
        return $subscribe(todos.subscribe("add", (onTodoAdded) => ({onTodoAdded})));
    }

    public onTodoUpdate(context: TestContext): Subscription<Todo> {
        const {todos} = context;
        return $subscribe(todos.subscribe("update", (onTodoUpdate) => ({onTodoUpdate})));
    }

    public onTodoDelete(context: TestContext): Subscription<Todo> {
        const {todos} = context;
        return $subscribe(todos.subscribe("delete", (onTodoDelete) => ({onTodoDelete})));
    }
}
