export abstract class TransformAbstract<TIn extends any[], TOut, TArgs extends any[] = never> {
    protected args: TIn;
    constructor(...args: TIn) {
        this.args = args;
    }

    public abstract transform(...args: TArgs): TOut;
}
