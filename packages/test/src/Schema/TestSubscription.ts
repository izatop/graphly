import {$subscribe, Subscription, SubscriptionType} from "@graphly/type";
import {Todo} from "./Query/Todo";
import {TestContext} from "./TestContext";

export class TestSubscription extends SubscriptionType {
    public async onTodoAdded(context: TestContext): Promise<Subscription<Todo>> {
        const {todos} = context;
        return $subscribe(Promise.resolve(todos.subscribe("add")));
    }

    public async onTodoUpdate(context: TestContext): Promise<Subscription<Todo>> {
        const {todos} = context;
        return $subscribe(todos.subscribe("update"));
    }

    public onTodoDelete(context: TestContext): Subscription<Todo> {
        const {todos} = context;
        return $subscribe(todos.subscribe("delete"));
    }
}
