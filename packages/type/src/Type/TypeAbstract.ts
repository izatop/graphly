import {Resolver, SchemaType} from "../Interface";

export type TypeProperty<T> = T | Resolver<T>;

export abstract class TypeAbstract<P extends TypeAbstract = any> {
    readonly [key: string]: TypeProperty<SchemaType | SchemaType[] | TypeAbstract | TypeAbstract[]>;
}
