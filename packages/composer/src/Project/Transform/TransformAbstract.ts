import {TransformError} from "./TransformError";

export abstract class TransformAbstract<TIn extends any[], TOut, TArgs extends any[] = never> {
    protected args: TIn;

    constructor(...args: TIn) {
        this.args = args;
    }

    public abstract transform(...args: TArgs): TOut;

    public assert(expr: any, message: string, diagnostic?: () => any) {
        if (!expr) {
            throw new TransformError(
                this.constructor.name,
                message,
                diagnostic && diagnostic(),
            );
        }
    }
}
