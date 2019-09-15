import {Arrayable, OutputType, Resolvable} from "../Interface";

export abstract class ObjectType {
    readonly [key: string]: Resolvable<Arrayable<OutputType>>;
}
