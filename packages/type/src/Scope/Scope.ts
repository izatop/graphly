import {ScopeOptions} from "../Interface";
import {Container} from "./Container";
import {Context} from "./Context";

export class Scope<X extends Context<C> = never, C extends Container = never> {
    protected options: ScopeOptions<X, C>;

    constructor(options: ScopeOptions<X, C>) {
        this.options = options;
    }
}
