import {Lookup} from "../Interface";
import {Container} from "./Container";

export class Context<C extends Container = never> {
    public readonly container!: Lookup<C>;

    public async resolve<A extends object>(source: A) {
        const destination = Object.create(source);
        const operations: Array<Promise<[string, any]>> = [];
        for (const [property, value] of Object.entries(source)) {
            if ("then" in value) {
                operations.push(value.then((solved: any) => [property, solved]));
            }
        }

        const entries = await Promise.all(operations);
        for (const [property, value] of entries) {
            Reflect.set(destination, property, value);
        }

        return Object.seal(destination) as Lookup<C>;
    }
}
