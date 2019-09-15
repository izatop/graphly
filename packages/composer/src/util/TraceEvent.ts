import {TransformError} from "../Project/Transform/TransformError";
import {SerializeError} from "../Serialization/SerializeError";
import {inspect} from "./inspect";

export class TraceEvent {
    public static verbose = false;

    protected readonly name: string;

    protected constructor(name: string) {
        this.name = name;
    }

    public static toggle(verbose?: boolean) {
        this.verbose = typeof verbose === "boolean"
            ? verbose
            : !this.verbose;
    }

    public static create(link: object) {
        return new this(link.constructor.name);
    }

    public emit(...args: any[]) {
        if (!TraceEvent.verbose) {
            return;
        }

        // tslint:disable-next-line:no-console
        console.log(`[${this.name}]`, ...args.map(inspect));
    }

    public warning<E extends Error>(error: E) {
        if (error instanceof SerializeError || error instanceof TransformError) {
            const {diagnostic} = error;
            // tslint:disable-next-line:no-console
            console.error(error, inspect({diagnostic}));
        } else {
            // tslint:disable-next-line:no-console
            console.error(error);
        }
    }

    public error<E extends Error>(error: E) {
        if (error instanceof SerializeError || error instanceof TransformError) {
            const {diagnostic} = error;
            // tslint:disable-next-line:no-console
            console.error(error, inspect({diagnostic}));
        } else {
            // tslint:disable-next-line:no-console
            console.error(error);
        }

        return error;
    }
}
